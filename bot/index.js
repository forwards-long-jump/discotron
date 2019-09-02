const Logger = require("./utils/logger.js");
Logger.setSeverity("debug");

const DiscordJS = require("discord.js");

let appConfig;
loadConfig();

const databaseHelper = require("./utils/database-helper.js");
// Database
if (!databaseHelper.databaseExists()) {
    databaseHelper.createDatabase();
}
databaseHelper.openDatabase();

const webserver = require("./webserver.js");
const discotron = require("./discotron.js");

const discordClient = new DiscordJS.Client();

global.discotron = discotron;
global.discordClient = discordClient;

discotron.loadOwners();

discotron.loadGuilds().then(() => {
    discotron.loadRepositories();

    // Web server
    webserver.startAPIServer();
    webserver.serveDashboard();

    connectToDiscord();
    registerEvents();
    discotron.registerActions();
});


function connectToDiscord() {
    Logger.log("Connecting to discord...");
    discordClient.login(appConfig.token).then(() => {}).catch((err) => {
        Logger.log("Could not connect to discord", "err");
        Logger.log(err.message, "err");
    });
}

function registerEvents() {
    // TODO: Handle error and reaction

    discordClient.on("ready", () => {
        Logger.log("Logged into Discord as **" + discordClient.user.tag + "**", "info");
    });

    discordClient.on("message", discotron.onMessage);
    discordClient.on("messageReactionAdd", discotron.onReaction);
    discordClient.on("guildCreate", discotron.onJoinGuild);
    discordClient.on("guildDelete", discotron.onLeaveGuild);
    discordClient.on("error", () => {
        // TODO: Handle reconnection and bot status update
    });
}

function loadConfig() {
    try {
        appConfig = require("./config/app-config.json");
        if (typeof appConfig.token === "undefined" || appConfig.token === "") {
            Logger.log("Missing **token** in **app-config.json**.", "err");
            process.exit();
        }
        if (typeof appConfig.applicationId === "undefined" || appConfig.applicationId === "") {
            Logger.log("Missing **applicationId** in **app-config.json**.", "err");
            process.exit();
        }
        if (typeof appConfig.oauth2Secret === "undefined" || appConfig.oauth2Secret === "") {
            Logger.log("Missing **oauth2Secret** in **app-config.json**.", "err");
            process.exit();
        }
        if (typeof appConfig.redirectURI === "undefined" || appConfig.redirectURI === "") {
            Logger.log("Missing **redirectURI** in **app-config.json**.", "err");
            process.exit();
        }
    } catch (err) {
        Logger.log("Please create **app-config.json** in bot/config.", "err");
        process.exit();
        return;
    }

}