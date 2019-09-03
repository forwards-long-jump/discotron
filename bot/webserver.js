const express = require("express");
const app = express();

const config = require(__dirname + "/config/config.json");
const Logger = require(__dirname + "/utils/logger.js");
const webAPI = require("./apis/web-api.js");

module.exports.serveDashboard = () => {
    app.use("/dashboard", express.static(__dirname + "/../dashboard"));
    app.use("/models", express.static(__dirname + "/../models"));
    app.get("/", (req, res) => {
        res.redirect("/dashboard");
    });
    app.get("/login", (req, res) => {
        res.redirect("/dashboard/login.html");
    });
};

module.exports.serveRepositoryFolder = (folderName, repositoryFolderName) => {
    if (["dashboard", "login", "models"].includes(folderName)) {
        Logger.log("Could not serve folder **" + folderName + "** because it is a reserved page name.", "warn");
        return;
    } else {
        app.use("/" + folderName, express.static(__dirname + "/repositories/" + repositoryFolderName + "/pages/" + folderName));
    }
};

module.exports.startAPIServer = () => {
    app.use(express.json());
    app.post("/api", webAPI.onPost);
};

app.listen(config.webServer.port, () => {
    Logger.log("Started Webserver on port **" + config.webServer.port + "**", "info");
}).on("error", (error) => {
    Logger.log("Could not start webserver on port **" + config.webServer.port + "**", "err");
    Logger.log(error, "err");
});