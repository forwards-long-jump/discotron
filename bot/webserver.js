const express = require("express");
const app = express();

const config = require(__dirname + "/config/config.json");
const Logger = require(__dirname + "/utils/logger.js");

const onPost = require("./apis/web-api.js").onPost;

module.exports.serveDashboard = () => {
    app.use("/dashboard", express.static(__dirname + "/../dashboard"));
    app.use("/models", express.static(__dirname + "/../models"));
    app.get("/", (req, res) => {
        res.redirect("/dashboard");
    });
};

module.exports.startAPIServer = () => {
    app.use(express.json());
    app.post("/api", onPost);
};

app.listen(config.webServer.port, () => { 
    Logger.log("Started Webserver on port **" + config.webServer.port + "**", "info");
}).on("error", (error) => {
    Logger.log("Could not start webserver on port **" + config.webServer.port + "**", "err");
    Logger.log(error, "err");
});




