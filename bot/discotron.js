const BotSettings = require("./classes/bot-settings.js");
const Repository = require("./classes/repository.js");
const Guild = require("./classes/guild.js");
const Plugin = require("./classes/plugin.js");
const Logger = require("./utils/logger.js");

const webAPI = require("./apis/web-api.js").getWebAPI("discotron-dashboard");

const botSettings = new BotSettings();

module.exports.onMessage = (message) => {
    Logger.log(`__${message.channel.name}__: ${message.content}`);

    /*

    
        for each plugin
            if user allowed to use plugin
                if (command && plugin-prefix) {
                    for each commands["command"]
                        if is triggered (words (without prefix), message) // isTrigger also checks ownersOnly, scope)
                            commands.push(...)
                if (commands is empty) {
                    for each commands["words"]
                        if is triggered (words (in array), message) // isTrigger also checks ownersOnly, scope)
                            commands.push(...)
                }

                // spam detection
                if commands not empty
                    for command in commands :
                        if !command.bypassSpamDetection
                            calculate user spam meter
                            if user spam meter > 100
                                user cooldown = 3000 years
                                dm user
                            break;

                for each commands["all"]
                    if is triggered (undefined, message) // isTrigger also checks ownersOnly, scope)
                        commands.push(...)

        
            
        for command in commands:
            command.trigger(words, ...) // command.trigger (switch this._triggerType)

    */

    if(false) {return;} // TODO: Maintenance && Owner check
    if(message.author.bot) {return;}
    if(false) {return;} // TODO: User spamming check

    let guild = Guild.get(message.guild.id);

    if(guild !== undefined && !guild.allowedChannelIds.includes(message.channel.id)) { return; }

    let commands = [];
    let loweredCaseMessage = message.content.toLowerCase();

    let isCommand = guild === undefined || message.startsWith(guild.commandPrefix);

    const plugins = Plugin.getAll();
    for (const pluginId in plugins) {
        const plugin = plugins[pluginId];
        if(guild !== undefined && !guild.isAdmin(message.author.id) && guild.permissions[pluginId].allows(message.author.id)) { continue; }

        if(isCommand && (guild === undefined || loweredCaseMessage.startsWith(guild.commandPrefix + plugin.prefix))) {
            for (let i = 0; i < plugin.commands.command.length; i++) {
                const command = plugin.commands.command[i];

                if(command.triggeredBy(message, loweredCaseMessage)) {
                    commands.push(command);
                }
            }
        }

        if(commands.length === 0) {
            for (let i = 0; i < plugin.commands.words.length; i++) {
                const command = plugin.commands.words[i];
                if(command.triggeredBy(message, loweredCaseMessage)) {
                    commands.push(command);
                }
            }  
        }

        // Spam detection
        if(commands.length !== 0) {
            for (let i = 0; i < commands.length; i++) {
                const command = commands[i];
                if(!command.bypassSpamDetection) {
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
            if(command.triggeredBy(message, loweredCaseMessage)) {
                commands.push(command);
            }
        }  
        Logger.log(commands);
        // Trigger valid messages
        const words = message.content.split(" ");
        for (let i = 0; i < commands.length; i++) {
            try {
                commands[i].doMessageAction(message, words);
            }
            catch(error) {
                Logger.log("An error occured in plugin: **" + plugin.name + "** while executing command **" + commands[i].trigger + "**", "err");
                Logger.log(error, "err");
            }
        }
    }

};

module.exports.onReaction = (reaction) => {};
module.exports.onJoinGuild = (guild) => {};
module.exports.onLeaveGuild = (guild) => {};

module.exports.getUserInfo = (userDiscordId) => {};
module.exports.getBotInfo = () => {};

module.exports.loadRepositories = () => {
    // TODO: Get repo in DB here
    let repositories = [{
        folderName: "test-repo",
        gitUrl: "https://github.com/gwizzy/test-plugin.git"
    }];

    for (let i = 0; i < repositories.length; i++) {
        new Repository(repositories[i].folderName, repositories[i].gitUrl);
    }
};

module.exports.registerActions = () => {
    webAPI.registerAction("set-bot-config", (data, reply) => {
        if (data === undefined) {
            return;
        }
        if (data.helpText !== undefined) {
            botSettings.helpText = data.helpText;
        }
        if (data.maintenance !== undefined) {
            botSettings.maintenance = data.maintenance;
        }
    }, "owner");
    webAPI.registerAction("get-bot-config", (data, reply) => {
        reply({
            helpText: botSettings.helpText,
            maintenance: botSettings.maintenance
        });
    }, "owner");
}