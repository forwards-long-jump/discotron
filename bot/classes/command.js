const CommandModel = require("./../../models/command.js");
const Owner = require("./owner.js");

/**
 * Command that can be executed, server side
 */
class Command extends CommandModel {
    /**
     * @constructor
     * @param {object} settings See CommandModel for details
     */
    constructor(settings) {
        super(settings);
    }

    /**
     * @returns {object} Object containing {triggerType, trigger, help, args, ownersOnly, requiresMention, bypassSpamDetection, scope}
     */
    toObject() {
        return {
            triggerType: this.triggerType,
            trigger: this.trigger,
            help: this.help,
            args: this.args,
            ownersOnly: this.ownersOnly,
            requiresMention: this.requiresMention,
            bypassSpamDetection: this.bypassSpamDetection,
            scope: this.scope
        };
    }

    /**
     * @param {Discord.DiscordMessage} discordMessage 
     * @param {string} loweredCaseMessage Message lowercase'd, passed as an arg to avoid calling toLowercase too many times
     * @param {string} prefixes Server and plugin prefix combined
     * @returns True if the command is triggered by the discordMessage
     */
    triggeredBy(discordMessage, loweredCaseMessage, prefixes) {
        if (this.ownersOnly && !Owner.isOwner(discordMessage.author.id)) {
            return false;
        }

        if (this.requiresMention && !discordMessage.isMentioned(global.discordClient.user)) {
            return false;
        }

        switch (this._triggerType) {
            case "command":
                let command = prefixes + this.trigger;
                return (loweredCaseMessage.startsWith(command + " ") || loweredCaseMessage === command);

            case "words":
                return this.trigger.every((t) => {
                    return loweredCaseMessage.includes(t);
                });

            default: // "all"
                return true;
        }
    }

    /**
     * @param {Discord.MessageReaction} messageReaction 
     * @returns True if the reaction triggers the command
     */
    triggeredByReaction(messageReaction) {
        // TODO
    }

    /**
     * Triggers the action of this command, build expected args
     * @param {Discord.Message} message 
     * @param {array} words List of words in the message, passed as an argument to avoid splitting multiple times
     * @param {object} apiCollection Object containing multiple APIs that can be used by the plugin
     */
    doMessageAction(message, words, apiCollection) {

        switch (this.triggerType) {
            case "command":
                let commandArgs = {
                    "all": words.slice(1)
                };

                // Build default args
                for (let i = 0; i < this.args.length; ++i) {
                    // When an arg has "allowsSpace" set, we eat all other args.
                    if (this.args[i].allowsSpace) {
                        commandArgs[this.args[i].name] = words.slice(i + 1).join(" ");

                        if (commandArgs[this.args[i].name] === "") {
                            commandArgs[this.args[i].name] = this.args[i].defaultValue;
                        }
                        break;
                    } else {
                        commandArgs[this.args[i].name] = (typeof words[i + 1] !== "undefined") ? words[i + 1] : this.args[i].defaultValue;
                    }
                }
                this.action(message, commandArgs, apiCollection);
                break;

            case "words":
                this.action(message, words, apiCollection);
                break;

            default:
                this.action(message, undefined, apiCollection);
                break;
        }
    }

    /**
     * Function to call to trigger the action of the command
     * @param {Discord.MessageReaction} messageReaction
     * @param {object} apiCollection Object containing multiple APIs that can be used by the plugin
     */
    doReactionAction(messageReaction) {
        // TODO
        this.action({
            messageReaction: messageReaction
        });
    }
}


module.exports = Command;