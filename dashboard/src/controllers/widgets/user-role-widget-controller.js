window.Discotron.UserRoleWidgetController = class extends window.Discotron.WidgetController {
    /**
     * Ctor
     * @param {Guild} guild Guild for which we list the users and roles
     * @param {array} usersRoles Currently selected users/roles for whatever setting this widget is needed
     * @param {function} onUserRoleSave Callback to be called when the user is done selecting the users/roles
     * @param {boolean} displayRoles True is the widget allows choosing roles as well as users
     * @param {string} headerText Help text displayed on top
     * @param {function} onClose Called when user cancels saving
     */
    constructor(guild, usersRoles, onUserRoleSave, displayRoles = true, headerText = "", onClose = () => {}) {
        super("user-role-selector.html", () => {
            onUserRoleSave(this._getUsersRoles());
        }, onClose);

        this._guild = guild;
        this._usersRoles = usersRoles;
        this._displayRoles = displayRoles;

        this._addEvents();
        this._displayUserRoleSelector();
    }

    /**
     * Get the user/role defined by the user in the html
     */
    _getUsersRoles() {

    }

    /**
     * Handle search selector helper and more
     */
    _addEvents() {

    }

    /**
     * Display user and roles on the widget
     */
    _displayUserRoleSelector() {

    }

    /**
     * Refresh users and role for current guild from web api
     */
    _onRefreshClick() {

    }
};