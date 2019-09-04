const CommandModel = require("./../../models/command.js");
const Owner = require("./owner.js");

class Command extends CommandModel {
    constructor(settings) {
        super(settings);
    }

    /**
     * @returns {object} Object containing {triggerType, trigger, help, args, ownersOnly, requires ..........}
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
     * Returns true if the command is triggered by the discordMessage
     * @param {array} words Message content without server-prefix and plugin-prefix (if there was any)
     * @param {Discord.DiscordMessage} discordMessage 
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
                return (loweredCaseMessage.startsWith(prefixes + this.trigger));

            case "words":
                return this.trigger.every((t) => {
                    return loweredCaseMessage.includes(t);
                });

            default: // "all"
                return true;
        }
    }

    /**
     * Return true if the reaction triggers the command
     * @param {Discord.MessageReaction} messageReaction 
     */
    triggeredByReaction(messageReaction) {
        // TODO: This is an advanced feature and was not planned but we plan to implement it later
    }

    /**
     * Function to call to trigger the action of the command
     * @param {Discord.Message} message 
     * @param {array} words 
     */
    doMessageAction(message, words, apiCollection) {

        switch (this.triggerType) {
            case "command":
                let commandArgs = {
                    "all": words.slice(1)
                };

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
     * @param {Discord.MessageReaction} reaction
     */
    doReactionAction(messageReaction) {
        this.action({
            messageReaction: messageReaction
        });
    }
}


module.exports = Command;