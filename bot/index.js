const DiscordJS = require("discord.js");
const fs = require("fs");

const Logger = require("./utils/logger.js");

const databaseHelper = require("./utils/database-helper.js");
const webserver = require("./webserver.js");
const discotron = require("./discotron.js");

const discordClient = new DiscordJS.Client();

Logger.setSeverity("debug");

// Database
if (!databaseHelper.databaseExists()) {
    databaseHelper.createDatabase();
}
databaseHelper.openDatabase();

// Web server
webserver.serveDashboard();
webserver.startAPIServer();

// TODO: If ownership claimed only
discotron.loadRepositories();

connectToDiscord();
registerEvents();

function connectToDiscord() {
    let token;
    try {
        token = fs.readFileSync("./config/token.txt",  "utf8");
    } catch (e) {
        Logger.log("Could not find token. Makes sure to create **token.txt** in bot/config and put your Discord bot token in it.", "err");
        process.exit();
        return;
    }

    if (token === "") {
        Logger.log("Empty token in **token.txt**. Please put your Discord bot token in it.", "err");
        process.exit();
        return;
    }
    
    Logger.log("Connecting to discord...");
    discordClient.login(token).then(() => {}).catch((err) => {
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