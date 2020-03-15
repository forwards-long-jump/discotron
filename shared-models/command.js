/**
 * Represents an argument of a command of a plugin
 */
class CommandArgumentModel {
    constructor({ name = "", help = "", allowsSpace = "" }) {
        this._name = name;
        this._help = help;
        this._allowsSpace = allowsSpace;
    }

    /**
     * @returns {string} Name of the argument
     */
    get name() {
        return this._name; 
    }

    /**
     * @returns {string} Help of the argument
     */
    get help() {
        return this._help; 
    }

    /**
     * @returns {boolean} True if the argument consumes the rest of the command
     */
    get allowsSpace() {
        return this._allowsSpace; 
    }
}

/**
 * Represents a command of a plugin
 */
class CommandModel {
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
    constructor({ triggerType = "command", trigger = [], help = "", args = [], ownersOnly = false, scope = "everywhere", requiresMention = false, bypassSpamDetection = false, action = () => { } } = {}) {
        this._triggerType = triggerType;
        this._trigger = trigger;
        this._help = help;
        this._args = [];

        for (let i = 0; i < args.length; ++i) {
            this._args.push(new CommandArgumentModel(args[i]));
        }

        this._args = args;
        this._ownersOnly = ownersOnly;
        this._scope = scope;
        this._requiresMention = requiresMention;
        this._bypassSpamDetection = bypassSpamDetection;
        this._action = action;
    }

    /**
     * @returns {string} trigger type
     */
    get triggerType() {
        return this._triggerType;
    }

    /**
     * @returns {string[]} trigger
     */
    get trigger() {
        return this._trigger;
    }

    /**
     * @returns {string} help
     */
    get help() {
        return this._help;
    }

    /**
     * @returns {object} args
     */
    get args() {
        return this._args;
    }

    /**
     * @returns {boolean} ownersOnly
     */
    get ownersOnly() {
        return this._ownersOnly;
    }

    /**
     * @returns {string} scope
     */
    get scope() {
        return this._scope;
    }

    /**
     * @returns {boolean} requiresMention
     */
    get requiresMention() {
        return this._requiresMention;
    }

    /**
     * @returns {boolean} bypassSpamDetection
     */
    get bypassSpamDetection() {
        return this._bypassSpamDetection;
    }

    /**
     * @returns {Function} action
     */
    get action() {
        return this._action;
    }
}

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
    module.exports = CommandModel;
} else {
    window.discotron.CommandModel = CommandModel;
}