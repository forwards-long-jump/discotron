const CommandModel = require("./../../models/command.js");

class Command extends CommandModel {
    constructor(settings) {
        super(settings);
    }

    /**
     * @returns {object} Object containing {triggerType, trigger, help, args, ownersOnly, requires ..........}
     */
    toObject() {

    }

    /**
     * Returns true if the command is triggered by the discordMessage
     * @param {array} words Message content without server-prefix and plugin-prefix 
     * @param {Discord.DiscordMessage} discordMessage 
     */
    triggeredBy(words, discordMessage) {
        switch (this._triggerType) {

        }
    }

    /**
     * Return true if the reaction triggers the command
     * @param {Discord.MessageReaction} messageReaction 
     */
    triggeredByReaction(messageReaction) {
        // TODO
    }

    /**
     * Function to call to trigger the action of the command
     * @param {array} words 
     * @param {Discord.Message} message 
     */
    trigger(words, message) {
        switch (this.triggerType) {

        }
    }

    /**
     * Function to call to trigger the action of the command
     * @param {Discord.MessageReaction} reaction 
     * @param {*} messageReaction 
     */
    triggerReaction(reaction, messageReaction) {
        switch (this.triggerType) {

        }
    }
}


module.exports = Command;


/*

    client.on("message", discotron.onMessage(...));

    // command|words|all|reactions (+requiresMention, ownersOnly, scope)
    
    discotron.onMessage = () => {
        // maintenance || owner
        // isbot
        // user not flagged as spsam
        
        let commands = []
        // if guildPrefix => command = true

        parse words into array (message.split(" ")) // ["!help", "arg1", "arg2"]
        
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