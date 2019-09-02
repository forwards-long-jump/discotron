const BotSettings = require("./classes/bot-settings.js");
const Repository = require("./classes/repository.js");
const Guild = require("./classes/guild.js");
const Plugin = require("./classes/plugin.js");
const Owner = require("./classes/owner.js");
const Logger = require("./utils/logger.js");
const Login = require("./classes/login.js");
const db = require("./apis/database-crud.js");

const webAPI = require("./apis/web-api.js").getWebAPI("discotron-dashboard");

const botSettings = new BotSettings();

let actions = {};

module.exports.on = (actionName, action) => {
    if (actions[actionName] === undefined) {
        actions[actionName] = [];
    }

    actions[actionName].push(action);
};

module.exports.triggerEvent = (actionName, data) => {
    if (actions[actionName] === undefined) {
        Logger.log("Cannot trigger inexistent action: **" + actionName +"**", "warn");
    } else {
        for (let i = 0; i < actions[actionName].length; i++) {
            actions[actionName][i](data);
        }
    }
};

module.exports.onMessage = (message) => {
    Logger.log(`__${message.channel.name}__: ${message.content}`);

    if (false) {
        return;
    } // TODO: Maintenance && Owner check
    if (message.author.bot) {
        return;
    }
    if (false) {
        return;
    } // TODO: User spamming check

    let guild = Guild.get(message.guild.id);

    if (guild !== undefined && (!guild.allowedChannelIds.includes(message.channel.id) && guild.allowedChannelIds.length > 0)) {
        return;
    }

    let loweredCaseMessage = message.content.toLowerCase();

    let isCommand = guild === undefined || message.content.startsWith(guild.commandPrefix);

    const plugins = Plugin.getAll();
    for (const pluginId in plugins) {
        let commands = [];
        const plugin = plugins[pluginId];
        if (guild !== undefined && guild.permissions[pluginId].allows(message.author.id)) {
            continue;
        }

        if (isCommand && (guild === undefined || loweredCaseMessage.startsWith(guild.commandPrefix + plugin.prefix))) {
            for (let i = 0; i < plugin.commands.command.length; i++) {
                const command = plugin.commands.command[i];

                if (command.triggeredBy(message, loweredCaseMessage)) {
                    commands.push(command);
                }
            }
        }

        if (commands.length === 0) {
            for (let i = 0; i < plugin.commands.words.length; i++) {
                const command = plugin.commands.words[i];
                if (command.triggeredBy(message, loweredCaseMessage)) {
                    commands.push(command);
                }
            }
        }

        // Spam detection
        if (commands.length !== 0) {
            for (let i = 0; i < commands.length; i++) {
                const command = commands[i];
                if (!command.bypassSpamDetection) {
                    // TODO: Spam meter, return if spamming
                    /*if user spam meter > 100
                        user cooldown = 3000 years
                        dm user
                    break;*/
                }
            }
        }

        // "All"
        for (let i = 0; i < plugin.commands.all.length; i++) {
            const command = plugin.commands.all[i];
            if (command.triggeredBy(message, loweredCaseMessage)) {
                commands.push(command);
            }
        }

        // Trigger valid messages
        const words = message.content.split(" ");
        for (let i = 0; i < commands.length; i++) {
            try {
                commands[i].doMessageAction(message, words);
            } catch (error) {
                Logger.log("An error occured in plugin: **" + plugin.name + "** while executing command **" + commands[i].trigger + "**", "err");
                Logger.log(error, "err");
            }
        }
    }

};

module.exports.loadGuilds = () => {
    return new Promise((resolve, reject) => {
        db.select("GuildSettings", ["discordGuildId"]).then((rows) => {
            for (let i = 0; i < rows.length; ++i) {
                new Guild(rows[i].discordGuildId);
            }
            resolve();
        });
    });
};

module.exports.updateGuilds = () => {
    let oldGuildIds = Object.keys(Guild.getAll());
    let newGuildIds = global.discordClient.guilds.map((guild) => {return guild.id;});

    // Delete abandonned guilds and add new ones
    let addedGuilds = [];
    let removedGuilds = [];
    for (let i = 0; i < newGuildIds.length; ++i) {
        const guildId = newGuildIds[i];
        if (!oldGuildIds.includes(guildId)) {
            addedGuilds.push(guildId);
        }
    }
    for (let i = 0; i < oldGuildIds.length; ++i) {
        const guildId = oldGuildIds[i];
        if (!newGuildIds.includes(guildId)) {
            removedGuilds.push(guildId);
        }
    }

    for (let i = 0; i < addedGuilds.length; ++i) {
        const guildId = addedGuilds[i];
        new Guild(guildId);
    }
    for (let i = 0; i < removedGuilds.length; ++i) {
        const guildId = removedGuilds[i];
        Guild.get(guildId).delete();
    }

    // Load *native* admins
    for (let i = 0; i < newGuildIds.length; ++i) {
        const guildId = newGuildIds[i];
        Guild.get(guildId).loadDiscordAdmins();
    }
};

module.exports.loadOwners = () => {
    Owner.getOwners().then((owners) => {
        if (owners.length === 0) {
            Login.setFirstLaunch();
        }
    });
};

module.exports.onReaction = (reaction) => {};
module.exports.onJoinGuild = (guild) => {};
module.exports.onLeaveGuild = (guild) => {};

module.exports.getUserInfo = (userDiscordId) => {};
module.exports.getBotInfo = () => {};

module.exports.getBotSettings = () => {
    return botSettings;
};

module.exports.loadRepositories = () => {
    db.select("Repositories").then((rows) => {
        if (rows.length === 0) {
            Logger.log("No repositories  found.", "warn");
        } else {
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                Logger.log("Loading repository **" + row.folderName + "**");
                let r = new Repository(row.folderName, row.gitUrl);
                // r.pull(); // DEBUG, update all repos
            }
        }
    });
};

module.exports.registerActions = () => {
    webAPI.registerAction("set-bot-config", (data, reply) => {
        if (data === undefined) {
            reply();
            return;
        }
        if (data.helpText !== undefined) {
            botSettings.helpText = data.helpText;
        }
        if (data.maintenance !== undefined) {
            botSettings.maintenance = data.maintenance;
        }
        reply();
    }, "owner");
    webAPI.registerAction("get-bot-config", (data, reply) => {
        reply({
            helpText: botSettings.helpText,
            maintenance: botSettings.maintenance
        });
    }, "owner");

    webAPI.registerAction("get-bot-info", (data, reply) => {
        reply({
            avatar: global.discordClient.user.displayAvatarURL,
            username: global.discordClient.user.tag
        });
    }, "everyone");


    Login.registerActions();
    Owner.registerActions();
    Repository.registerActions();
    Guild.registerActions();
    Plugin.registerActions();
};