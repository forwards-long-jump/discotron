const BotSettings = require("./classes/bot-settings.js");
const Repository = require("./classes/repository.js");
const Guild = require("./classes/guild.js");
const Plugin = require("./classes/plugin.js");
const Owner = require("./classes/owner.js");
const SpamUser = require("./classes/spam-user.js");
const Logger = require("./utils/logger.js");
const Login = require("./classes/login.js");
const db = require("./apis/database-crud.js");
const discordClientProvider = require("./apis/discord-client-provider.js");

const webAPI = require("./apis/web-api.js").getWebAPI("discotron-dashboard");

const botSettings = new BotSettings();

let actions = {};

/**
 * Add a listener for Discotron events
 * Valid actions are: "plugin-loaded", "plugin-delete"
 * @param {string} actionName Name of the action
 * @param {Function} action Function to call when the action occurs
 */
module.exports.on = (actionName, action) => {
    if (actions[actionName] === undefined) {
        actions[actionName] = [];
    }

    actions[actionName].push(action);
};

/**
 * Triggers a Discotron event
 * @param {string} actionName Name of the action to trigger
 * @param {object} data Object that will be passed to the functions
 */
module.exports.triggerEvent = (actionName, data) => {
    if (actions[actionName] === undefined) {
        Logger.log("Cannot trigger inexistent action: **" + actionName + "**", "warn");
    } else {
        for (let i = 0; i < actions[actionName].length; i++) {
            actions[actionName][i](data);
        }
    }
};

/**
 * Should be called when the bot receives a message
 * Handles message reception
 * @param {DiscordJS.Message} message Received message
 */
module.exports.onMessage = (message) => {
    Logger.log(`__#${message.channel.name}__ <${message.author.tag}>: ${message.content}`);
    if (message.author.bot) {
        return;
    }

    if (botSettings.maintenance && !Owner.isOwner(message.author.id)) {
        return;
    }

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

        if (guild !== undefined && (!guild.enabledPlugins.has(pluginId) && guild.enabledPlugins.size > 0)) {
            continue;
        }

        let prefix = "";

        if (guild !== undefined) {
            prefix += guild.commandPrefix;
        }

        prefix += plugin.prefix;

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
                    Logger.log("An error occurred in plugin: **" + plugin.name + "** while executing command **" + command.trigger + "**", "err");
                    Logger.log(error, "err");
                }
            }
        }
    }

};

/**
 * Load guild settings from database
 * TODO: This should probably be moved into the guild class
 * @returns {Promise} resolve(), reject();
 */
module.exports.loadGuilds = () => {
    return new Promise((resolve, reject) => {
        return db.select("GuildSettings", ["discordGuildId"]).then((rows) => {
            for (let i = 0; i < rows.length; ++i) {
                new Guild(rows[i].discordGuildId);
            }
            resolve();
        });
    });
};

/**
 * Reload guilds, admins from the guild object
 * TODO: Move this in the Guild class
 * TODO: Call this when guilds change
 * TODO: Check if it's complete
 */
module.exports.updateGuilds = () => {
    let oldGuildIds = Object.keys(Guild.getAll());
    let newGuildIds = discordClientProvider.get().guilds.map((guild) => {
        return guild.id;
    });

    // Delete abandoned guilds and add new ones
    let addedGuilds = [];
    let removedGuilds = [];
    for (let i = 0; i < newGuildIds.length; ++i) {
        const discordGuildId = newGuildIds[i];
        if (!oldGuildIds.includes(discordGuildId)) {
            addedGuilds.push(discordGuildId);
        }
    }
    for (let i = 0; i < oldGuildIds.length; ++i) {
        const discordGuildId = oldGuildIds[i];
        if (!newGuildIds.includes(discordGuildId)) {
            removedGuilds.push(discordGuildId);
        }
    }

    for (let i = 0; i < addedGuilds.length; ++i) {
        const discordGuildId = addedGuilds[i];
        new Guild(discordGuildId);
    }
    for (let i = 0; i < removedGuilds.length; ++i) {
        const discordGuildId = removedGuilds[i];
        Guild.get(discordGuildId).delete();
    }

    // Load *native* admins
    for (let i = 0; i < newGuildIds.length; ++i) {
        const discordGuildId = newGuildIds[i];
        Guild.get(discordGuildId).loadDiscordAdmins();
    }
};

/**
 * Load owners
 * TODO: Move this in the owner class
 */
module.exports.loadOwners = () => {
    Owner.getOwners().then((owners) => {
        if (owners.length === 0) {
            Login.setFirstLaunch();
        }
    }).catch(Logger.err);
};

// TODO
module.exports.onReaction = (reaction) => {};
module.exports.onJoinGuild = (guild) => {};
module.exports.onLeaveGuild = (guild) => {};
module.exports.getBotInfo = () => {};

/**
 * Retrieves user information from discord
 * TODO: Fix possible call to undefined
 * TODO: Cache the results
 * TODO: Move this in a new user class
 * @param {string} discordId Discord user id
 * @returns {Promise} resolve(user {object}), reject()
 */
function getUserInfo(discordId) {
    return new Promise((resolve, reject) => {
        discordClientProvider.get().fetchUser(discordId).then((user) => {
            resolve({
                discordId: user.id,
                name: user.username,
                tag: user.tag,
                discriminator: user.discriminator,
                avatarURL: user.displayAvatarURL
            });
        }).catch((e) => {
            Logger.log("Could not get user info", "err");
            Logger.log(e, "err");
        });
    });
}

/**
 * @returns {object} Bot settings
 */
module.exports.getBotSettings = () => {
    return botSettings;
};

/**
 * Load repositories from the database, which will build most things
 */
module.exports.loadRepositories = () => {
    db.select("Repositories").then((rows) => {
        if (rows.length === 0) {
            Logger.log("No repositories found.", "warn");
        } else {
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                Logger.log("Loading repository **" + row.folderName + "**");
                new Repository(row.folderName, row.repositoryURL);
            }
        }
    }).catch(Logger.err);
};

/**
 * Register webAPI actions related to Discotron
 */
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

        if (data.presenceText !== undefined) {
            botSettings.presenceText = data.presenceText;
        }

        reply();
    }, "owner");

    webAPI.registerAction("get-bot-config", (data, reply) => {
        reply({
            helpText: botSettings.helpText,
            presenceText: botSettings.presenceText,
            maintenance: botSettings.maintenance,
            status: discordClientProvider.get().status
        });
    }, "owner");

    webAPI.registerAction("restart-bot", (data, reply) => {
        Logger.log("Restarting bot...");
        discordClientProvider.get().destroy().then(() => {
            return global.discotron._connectToDiscord().then(() => {
                reply(true);
            });
        }).catch(Logger.err);
    }, "owner");

    webAPI.registerAction("get-bot-info", (data, reply) => {
        const discordClient = discordClientProvider.get();
        if (discordClient.user !== null) {
            reply({
                avatar: discordClient.user.displayAvatarURL,
                tag: discordClient.user.tag
            });
        } else {
            reply({
                avatar: "/dashboard/images/outage.png",
                tag: "Bot offline"
            });
        }
    }, "everyone");

    webAPI.registerAction("get-user-info", (data, reply) => {
        getUserInfo(data.discordId).then((info) => {
            reply(info);
        }).catch(Logger.err);
    });


    Login.registerActions();
    Owner.registerActions();
    Repository.registerActions();
    Guild.registerActions();
    Plugin.registerActions();
};