class Command {
    constructor(triggerType, trigger, help, args, ownersOnly, scope, action) {
        this._triggerType = triggerType;
        this._trigger = trigger;
        this._help = help;
        this._args = args;
        this._ownersOnly = ownersOnly;
        this._scope = scope;
        this._action = action;
    }
}