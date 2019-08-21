class Command {
    /**
     * 
     * @param {*} trigger 
     * @param {*} action 
     * @param {*} help 
     * @param {*} args 
     * @param {*} triggerType 
     * @param {*} scope 
     * @param {*} defaultPermission 
     * @param {*} ownerOnly 
     */
    constructor(trigger, action, help, args = [], triggerType = "command", scope = "everywhere", defaultPermission = "everyone", ownerOnly = false) {
        this._triggerType = triggerType; // "["command"]|"words"|"all"|"reactions"|"mention"";
        this._trigger = trigger; // can be array
        this._help = help;
        this._args = args; // Given as object in action
        this._defaultPermission = defaultPermission; //["everyone"], "admin", "nobody"
        this._ownerOnly = ownerOnly;
        this._scope = scope; // "[everywhere]", "pm", "guild"
        this._action = action;
    }
}


module.exports = Command;