/**
 * Represents a command, dashboard side
 */
window.discotron.Command = class extends window.discotron.CommandModel {
    /**
     * @class
     * @param {object} settings Settings
     * @param {string} [settings.triggerType = "command"] Type of trigger, can be "command|words|all|reaction" (note: "all" is not affected by spam detection)
     * @param {string[]} [settings.trigger = []] Word(s) triggering the command
     * @param {string} [settings.help = ""] Describe the command
     * @param {object} [settings.args = []] Arguments of the command : e.g. [{name: "turns", defaultValue: 8, help: "Number of turns"}]
     * @param {Function} [settings.action = () => {}] Action to trigger when the command is called. Receives args, discordMessage as parameters
     * @param {boolean} [settings.ownersOnly = false] True to only allow the owner(s) to use the command
     * @param {boolean} [settings.requiresMention = false] Set to true if the bot must be mentioned for that
     * @param {boolean} [settings.bypassSpamDetection = false] Set to true to not penalize the user for spamming the command.
     * @param {string} [settings.scope = "everywhere"] Scope where the command can be triggered, can be "everywhere|pm|guild"
     */
    constructor(settings) {
        super(settings);
    }
};