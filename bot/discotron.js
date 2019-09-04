const BotSettings = require("./classes/bot-settings.js");
const Repository = require("./classes/repository.js");
const Guild = require("./classes/guild.js");
const Plugin = require("./classes/plugin.js");
const Owner = require("./classes/owner.js");
const SpamUser = require("./classes/spam-user.js");
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
        Logger.log("Cannot trigger inexistent action: **" + actionName + "**", "warn");
    } else {
        for (let i = 0; i < actions[actionName].length; i++) {
            actions[actionName][i](data);
        }
    }
};

module.exports.onMessage = (message) => {
    Logger.log(`__#${message.channel.name}__ <${message.author.tag}>: ${message.content}`);
    if (message.author.bot) {
        return;
    }

    if (botSettings.maintenance && !Owner.isOwner(message.author.id)) {
        return;
    }

    if (false) {
        return;
    } // TODO: User spamming check

    let guild;
    if (message.guild !== null) {
        guild = Guild.get(message.guild.id);
    }

    if (guild !== undefined && (!guild.allowedChannelIds.has(message.channel.id) && guild.allowedChannelIds.size > 0)) {
        return;
    }

    let loweredCaseMessage = message.content.toLowerCase();

    let isCommand = guild === undefined || message.content.startsWith(guild.commandPrefix);

    const plugins = Plugin.getAll();
    for (const pluginId in plugins) {
        let commands = [];
        const plugin = plugins[pluginId];

        if (!plugin.enabled) {
            continue;
        }

        if (guild !== undefined && !guild.permissions[pluginId].allows(message.author.id)) {
            continue;
        }

        let prefix = "";

        if (guild !== undefined) {
            prefix += guild.commandPrefix;
        }

        prefix += plugin.prefix;

        // TODO: Check if plugin enabled in guild

        if (isCommand && (loweredCaseMessage.startsWith(prefix))) {
            for (let i = 0; i < plugin.commands.command.length; i++) {
                const command = plugin.commands.command[i];

                if (command.triggeredBy(message, loweredCaseMessage, prefix)) {
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
        if (commands.length !== 0 && !Owner.isOwner(message.author.id)) {
            for (let i = 0; i < commands.length; i++) {
                const command = commands[i];
                if (!command.bypassSpamDetection) {
                    SpamUser.onAction(message.author);
                    if (SpamUser.isRestricted(message.author)) {
                        commands = [];
                    }
                    break;
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
            const command = commands[i];
            if (command.scope === "everywhere" || (command.scope === "pm" && guild === undefined) || (command.scope === "guild" && guild !== undefined)) {
                try {
                    command.doMessageAction(message, words, plugin.getApiObject());
                } catch (error) {
                    Logger.log("An error occured in plugin: **" + plugin.name + "** while executing command **" + command.trigger + "**", "err");
                    Logger.log(error, "err");
                }
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
    let newGuildIds = global.discordClient.guilds.map((guild) => {
        return guild.id;
    });

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

module.exports.updateStatus = () => {
    botSettings.setBotPresence();
};

module.exports.onReaction = (reaction) => {};
module.exports.onJoinGuild = (guild) => {};
module.exports.onLeaveGuild = (guild) => {};

function getUserInfo(discordId) {
    return new Promise((resolve, reject) => {
        global.discordClient.fetchUser(discordId).then((user) => {
            resolve({
                id: user.id,
                name: user.username,
                avatarURL: user.displayAvatarURL
            });
        });
    });
};
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
                let r = new Repository(row.folderName, row.repositoryURL);
                // r.pull(); // DEBUG, update all repos
            }
        }
    });
};

module.exports.registerActions = () => {
    webAPI.registerAction("set-bot-config", (data, reply) => {
        if (data === undefined) {
            reply(false);
            return;
        }
        if (data.helpText !== undefined) {
            botSettings.helpText = data.helpText;
        }
        if (data.maintenance !== undefined) {
            botSettings.maintenance = data.maintenance;
        }
        if (data.statusText !== undefined) {
            botSettings.statusText = data.statusText;
        }
        reply();
    }, "owner");

    webAPI.registerAction("get-bot-config", (data, reply) => {
        reply({
            helpText: botSettings.helpText,
            botStatus: botSettings.statusText,
            maintenance: botSettings.maintenance,
            status: global.discordClient.status
        });
    }, "owner");

    webAPI.registerAction("restart-bot", (data, reply) => {
        Logger.log("Restarting bot...");
        global.discordClient.destroy().then(() => {
            global.discordClient._connectToDiscord().then(() => {
                reply(true);
            });
        });
    }, "owner");

    webAPI.registerAction("get-bot-info", (data, reply) => {
        if (global.discordClient.user !== null) {
            reply({
                avatar: global.discordClient.user.displayAvatarURL,
                username: global.discordClient.user.tag
            });
        } else {
            reply({
                avatar: "/dashboard/images/outage.png",
                username: "Bot offline"
            });
        }
    }, "everyone");

    webAPI.registerAction("get-user-info", (data, reply) => {
        getUserInfo(data.discordId).then((info) => {
            reply(info);
        });
    });


    Login.registerActions();
    Owner.registerActions();
    Repository.registerActions();
    Guild.registerActions();
    Plugin.registerActions();
};