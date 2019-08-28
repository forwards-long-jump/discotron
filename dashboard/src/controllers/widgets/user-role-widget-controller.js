window.Discotron.UserRoleWidgetController = class extends window.Discotron.WidgetController {

    constructor(guildId, usersRoles, onUserRoleSave, displayRoles = true, onClose = () => {}) {
        super("user-role.html", () => {
            onUserRoleSave(this._getUsersRoles());
        }, onClose);

        this._guildId = guildId;
        this._usersRoles = usersRoles;
        this._displayRoles = displayRoles;

        this._addEvents();
        this._displayUserRoleSelector();
    }

    _getUsersRoles() {
		
    }

    _addEvents() {

    }

    _displayUserRoleSelector() {

	}
	
	_onRefreshClick() {
		
	}
};