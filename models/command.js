/**
 * Represents a command of a plugin
 */
class CommandModel {
    /**
     * Ctor
     * @param {object} settings Settings
     * @param {string} [settings.triggerType = "command"] Type of trigger, can be "command|words|all|reactions" (note: "all" is not affected by spam detection)
     * @param {string[]} [settings.trigger = []] Word(s) triggering the command
     * @param {string} [settings.help = ""] Describe the command
     * @param {object} [settings.args = []] Arguments of the command : e.g. [{name: "turns", defaultValue: 8, help: "Number of turns"}]
     * @param {function} [settings.action = () => {}] Action to trigger when the command is called. Receives args, discordMessage as parameters
     * @param {boolean} [settings.ownersOnly = false] True to only allow the owner(s) to use the command
     * @param {boolean} [settings.requiresMention = false] Set to true if the bot must be mentioned for that
     * @param {boolean} [settings.bypassSpamDetection = false] Set to true to not penalize the user for spamming the command.
     * @param {string} [settings.scope = "everywhere"] Scope where the command can be triggered, can be "everywhere|pm|guild"
     */
    constructor(settings) {
        let options = Object.assign({}, CommandModel.defaultSettings, settings);

        this._triggerType = options.triggerType;
        this._trigger = options.trigger;
        this._help = options.help;
        this._args = options.args;
        this._ownersOnly = options.action;
        this._scope = options.ownersOnly;
        this._requiresMention = options.requiresMention;
        this._bypassSpamDetection = options.bypassSpamDetection;
        this._action = options.scope;
    }

    get triggerType() {
        return this._triggerType;
    }
    get trigger() {
        return this._trigger;
    }
    get help() {
        return this._help;
    }
    get args() {
        return this._args;
    }
    get ownersOnly() {
        return this._ownersOnly;
    }
    get scope() {
        return this._scope;
    }
    get requiresMention() {
        return this._requiresMention;
    }
    get bypassSpamDetection() {
        return this._bypassSpamDetection;
    }
    get action() {
        return this._action;
    }
}

CommandModel.prototype.defaultSettings = {
    triggerType: "command",
    trigger: [], // can be array
    help: "",
    args: [], // {name: "turn", defaultValue: 0, help: ""}
    ownersOnly: false,
    scope: "everywhere", // PM, GUILD
    requiresMention: false,
    bypassSpamDetection: false,
    action: () => []
};


if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
    module.exports = CommandModel;
} else {
    window.Discotron.CommandModel = CommandModel;
}