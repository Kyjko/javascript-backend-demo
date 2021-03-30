const express = require("express");
require("dotenv").config();
const con = require("./config/dbconf");
const bodyParser = require("body-parser");

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

const port = 4000 || process.env.port;

con.connect(e => {
    if(e) throw e;
    console.log("connected to mysql RDBMS!");
});

const authRoute = require("./routes/authRoute");

app.use("/api/manageusers", authRoute);

app.get("/", (req, res) => {
    res.send("nothing here...");
});

app.listen(port, () => {
    console.log(`server listening on port ${port}`);
});
