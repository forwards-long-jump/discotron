const express = require("express");
const app = express();

const config = require(__dirname + "/config/config.json");
const Logger = require(__dirname + "/utils/logger.js");

module.exports.serveDashboard = () => {
    app.use("/dashboard", express.static(__dirname + "/../dashboard"));
    app.use("/models", express.static(__dirname + "/../models"));
    app.get("/", (req, res) => {
        res.redirect("/dashboard");
    });
};

app.listen(config.webServer.port, (error) => {
    if(error === undefined) {   
        Logger.log("Started Webserver on port **" + config.webServer.port + "**", "info");
    }
    else {
        Logger.log("Could not start webserver on port **" + config.webServer.port + "**", "err");
        Logger.log(error, "err");
    }
});