const express = require("express");
const app = express();
const fs = require("fs");

const http = require("http");
const https = require("https");
const config = require("../config.json");
const Logger = require("../../core/utils/logger.js");
const webAPI = require("./api.js");

const appConfig = require(global.discotronConfigPath + "/bot.json");

/**
 * Serve the dashboard, login and models folders
 */
module.exports.serveDashboard = () => {
    app.use("/dashboard", express.static(__dirname + "/../www"));
    app.use("/shared", express.static(__dirname + "/../../shared"));
    app.use("/dashboard/config/dashboard.js", express.static(global.discotronConfigPath + "/dashboard.js"));
    app.get("/", (req, res) => {
        res.redirect("/dashboard");
    });
    app.get("/login", (req, res) => {
        res.redirect("/dashboard/login.html");
    });
};

/**
 * Serve pages from a repository
 * @param {string} folderName Name of the folder in the repository
 * @param {string} repositoryFolderName Name of the folder of the repository
 */
module.exports.serveRepositoryFolder = (folderName, repositoryFolderName) => {
    if (["dashboard", "login", "models"].includes(folderName)) {
        Logger.warn("Could not serve folder **" + folderName + "** because it is a reserved page name.");
    } else {
        app.use("/" + folderName, express.static(global.discotronConfigPath + "/repositories/" + repositoryFolderName + "/pages/" + folderName));
    }
};

/**
 * Serve API pages
 */
module.exports.startAPIServer = () => {
    app.use(express.json());
    app.post("/api", webAPI.onPost);
};

let server;
if (typeof appConfig.privateKey === "undefined" || typeof appConfig.certificate === "undefined" ||
    appConfig.privateKey === "" || appConfig.certificate === "") {

    Logger.warn(`**Dashboard and web pages are served without https!**
A hacker could **easily** access your computer as well as compromising all Discord guilds the bot is in.
To prevent that, secure your server using a service like **letsencrypt**.
You can then add **privateKeyPath** and **certificatePath** in __bot.json__ to fix the issue.
This warning will go away once the server is secured.`);

    server = http.createServer(app);
} else {
    let credentials = {};

    try {
        credentials = {
            key: fs.readFileSync(appConfig.privateKey),
            cert: fs.readFileSync(appConfig.certificate)
        };
    } catch (e) {
        Logger.err("Could not load https cert/key", e);
        process.exit();
    }

    server = https.createServer(credentials, app);
}

server.listen(config.webServer.port, () => {
    Logger.info("Started webserver on port **" + config.webServer.port + "**");
}).on("error", (error) => {
    Logger.err("Could not start webserver on port **" + config.webServer.port + "**", error);
});
