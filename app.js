const http = require('http');
const path = require("node:path");
const express = require("express");
const app = express();
const indexRouter = require("./routes/indexRouter");

const PORT = 3000;

app.use("/", indexRouter);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.listen(PORT, () => {
    console.log(`The server is listening on port ${PORT}`);
});