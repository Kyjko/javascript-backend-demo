const router = require("express").Router();
const con = require("../config/dbconf");
const Joi = require("@hapi/joi");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const schema = Joi.object({
    username: Joi.string().min(6).max(45).required(),
    password: Joi.string().min(8).max(45).required()
    .pattern(new RegExp("^[a-zA-Z0-9]{8,45}$"))
});
router.post("/register", async (req, res) => {
    const {value, error} = schema.validate({username: req.body.username,
    password: req.body.password});
    if(error) return res.status(400).send("Supplies data does not meet validation schema.");
    let username = req.body.username;
    let password = req.body.password;
    let checkIfUserAlreadyExistsSQL = "select username from users where username = ?";
    let isUserAlreadyExists = false;
    con.query(checkIfUserAlreadyExistsSQL, [username], (e, r) => {
        if(r.length >= 1) {isUserAlreadyExists = true;} else {isUserAlreadyExists = false;}
    });
    if(isUserAlreadyExists) return res.status(400).send("Username already registered!");
    let salt = await bcrypt.genSalt(10);
    let epassword = await bcrypt.hash(password, salt);
    let sql = "insert into users (username, password, is_admin) values (?, ?, 1)";
    con.query(sql, [username, epassword], (e, r) => {
        if(e) return res.status(500).send(`internal server error!\n${e}`);
        res.send("successfully registered new user!");
    });
});
router.post("/login", async (req, res) => {
    let sql = "select * from users where username = ?";
    con.query(sql, [req.body.username], async (e, r) => {
        if(e) res.status(500).send("internal server error");
        if(r.length === 0) {res.status(400).send("invalid credentials");} else {
            const isValid = await bcrypt.compare(req.body.password, r[0].password);
            if(!isValid) {res.status(400).send("invalid credentials");} else {
                const token = jwt.sign({_id: r[0].id}, process.env.TOKEN_SECRET);
                res.header("auth-token", token).send(token);    
            } 
        } 
    });    
});
module.exports = router;

