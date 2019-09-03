window.Discotron.UserRoleWidgetController = class extends window.Discotron.WidgetController {
    /**
     * Ctor
     * @param {Guild} guild Guild for which we list the users and roles
     * @param {array} usersRoles Currently selected users/roles for whatever setting this widget is needed
     * @param {function} onUserRoleSave Callback to be called when the user is done selecting the users/roles
     * @param {boolean} displayRoles True is the widget allows choosing roles as well as users
     * @param {string} headerText Help text displayed on top
     * @param {boolean} allowNone Allows to enter no users nor roles
     * @param {function} onClose Called when user cancels saving
     */
    constructor(guild, usersRoles, onUserRoleSave, displayRoles = true, headerText = "", allowNone = false, onClose = () => {}) {
        super("user-role-selector.html", () => {
            onUserRoleSave(this._getUsersRoles());
        }, () => {
            this._guild = guild;
            this._headerText = headerText;
            this._usersRoles = usersRoles;
            this._displayRoles = displayRoles;
            this._allowNone = allowNone;

            this._displayUserRoleSelector();
        }, onClose);
    }

    /**
     * Get the user/role defined by the user in the html
     */
    _getUsersRoles() {
        // TODO: for each element in user-list-container
        //   this._widgetContainer.querySelectorAll(".user-name") // for each, element.dataset.xxxx
        return {
            userIds: [],
            roleIds: []
        };
    }

    /**
     * Handle search selector helper and more
     */
    _addEvents() {
        super._addEvents();


    }

    /**
     * Display user and roles on the widget
     */
    _displayUserRoleSelector() {
        this._widgetContainer.querySelector(".widget-header").textContent = this._headerText;

        // Users
        for (let i = 0; i < this._usersRoles.length; ++i) {
            let userRole = this._usersRoles[i];
            if (userRole.type === "user") {
                Discotron.User.get(this._usersRoles[i].discordId).then((user) => {
                    this._addUserEntry(user);
                });
            }
        }

        // Roles
        if (this._displayRoles) {
            for (let i = 0; i < this._usersRoles.length; ++i) {
                let userRole = this._usersRoles[i];
                if (userRole.type === "role") {
                    Discotron.Role.get(this._usersRoles[i].discordId).then((role) => {
                        this._addRoleEntry(role);
                    });
                }
            }
        } else {
            document.querySelector("#role-container").style.display = "none";
        }
    }

    _addUserEntry(user) {
        let usersContainer = document.querySelector(".user-list-container");
        let userTemplate = document.querySelector("#user-entry");

        let userEntry = document.importNode(userTemplate.content, true);
        userEntry.querySelector("span").innerHTML += user._name;

        let container = userEntry.querySelector("span");
        userEntry.querySelector("span").onclick = () => {
            this._removeEntry(user._id, "user");
            container.remove();
        };

        usersContainer.appendChild(userEntry);
    }

    _addRoleEntry(role) {
        let rolesContainer = document.querySelector(".role-list-container");
        let roleTemplate = document.querySelector("#role-entry");

        let roleEntry = document.importNode(roleTemplate.content, true);

        roleEntry.querySelector("role-color").style.color = role.color;
        roleEntry.querySelector(".role-name").textContent = role.name;
        let container = roleEntry.querySelector("span");
        roleEntry.querySelector(".role-name").onclick = () => {
            this._removeEntry(role._id, "role");
            container.remove();
        };

        rolesContainer.appendChild(roleEntry);
    }

    _removeEntry(id, type) {
        for (let i = 0; i < this._usersRoles.length; ++i) {
            let ur = this._usersRoles[i];
            if (ur._discordId === id && ur._type === type) {
                this._usersRoles.splice(i, 1);
                console.log(this._usersRoles)
                break;
            }
        }
        
        if (!this._allowNone) {
            this._widgetContainer.querySelector(".save-button").disabled = (this._usersRoles.lenght === 0);
        }
    }

    /**
     * Refresh users and role for current guild from web api
     */
    _onRefreshClick() {

    }
};