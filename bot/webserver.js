const express = require("express");
const app = express();

const http = require("http");
const https = require("https");
const config = require(__dirname + "/config/config.json");
const Logger = require(__dirname + "/utils/logger.js");
const webAPI = require("./apis/web-api.js");

const appConfig = require("./config/app-config.json");

const credentials = {
    key: appConfig.privateKey,
    cert: appConfig.certificate
};

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

if (credentials.key === undefined || credentials.certificate === undefined) {
    Logger.log("**Dashboard and web pages are served without https!**", "warn");
    Logger.log("A hacker could **easily** access your computer as well as compromising all Discord guilds the bot is in.", "warn");
    Logger.log("To prevent that, secure your server using a service like **letsencrypt**.", "warn");
    Logger.log("You can then add **privateKeyPath** and **certificatePath** in __bot/config/app-config.json__ to fix the issue.", "warn");
    Logger.log("This warnig will go away once the server is secured.", "warn");


    const httpServer = http.createServer(app);

    httpServer.listen(config.webServer.port, () => {
        Logger.log("Started Webserver on port **" + config.webServer.port + "**", "info");
    }).on("error", (error) => {
        Logger.log("Could not start webserver on port **" + config.webServer.port + "**", "err");
        Logger.log(error, "err");
    });
} else {
    const httpsServer = https.createServer(credentials, app);
    httpsServer.listen(config.webServer.port, () => {
        Logger.log("Started Webserver on port **" + config.webServer.port + "**", "info");
    }).on("error", (error) => {
        Logger.log("Could not start webserver on port **" + config.webServer.port + "**", "err");
        Logger.log(error, "err");
    });

}