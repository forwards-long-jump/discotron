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

            if (this._guild !== undefined) {
                document.querySelector("#add-button").disabled = true;
                this._loadMembers();
                this._loadRoles();
            }

            this._displayUserRoleSelector();
        }, onClose);
    }

    /**
     * Get the user/role defined by the user in the html
     */
    _getUsersRoles() {
        return this._usersRoles;
    }

    /**
     * Handle search selector helper and more
     */
    _addEvents() {
        super._addEvents();

        let input = document.querySelector("#name-input");
        let button = document.querySelector("#add-button");

        if (this._guild !== undefined) {
            input.onkeyup = () => {
                if (input.value !== "") {
                    this._checkNameValidity(input.value);
                }
            };
        }



        button.onclick = () => {
            let value = input.value;
            input.value = "";
            if (this._guild === undefined) {
                // The text is a user ID, we try to send it directly
                Discotron.User.get(value).then((user) => {
                    this._addUserEntry(user);
                });
            } else {
                // The text is the name of a role or a user
                this._addEntry(value);
            }
        }
    }

    /**
     * Activates the add button if the name corresponds to 
     */
    _checkNameValidity(name) {
        document.querySelector("#add-button").disabled = true;

        for (let i = 0; i < this._guild.members.length; ++i) {
            Discotron.User.get(this._guild.members[i]).then((user) => {
                if (user._name === name) {
                    document.querySelector("#add-button").disabled = false;
                }
            });
        }

        if (this._displayRoles) {
            for (let i = 0; i < this._guild.roles.length; ++i) {
                Discotron.Role.get(this._guild.roles[i]).then((role) => {
                    if (role._name === name) {
                        document.querySelector("#add-button").disabled = false;
                    }
                });
            }
        }
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
                    this._displayUserEntry(user);
                });
            }
        }

        // Roles
        if (this._displayRoles) {
            for (let i = 0; i < this._usersRoles.length; ++i) {
                let userRole = this._usersRoles[i];
                if (userRole.type === "role") {
                    Discotron.Role.get(this._usersRoles[i].discordId).then((role) => {
                        this._displayRoleEntry(role);
                    });
                }
            }
        } else {
            document.querySelector("#role-container").style.display = "none";
        }
    }

    _addUserEntry(user) {
        if (this._hasUserRoleAlready(user._id)) {
            return;
        }
        this._usersRoles.push(new Discotron.UserRole(user._id, "user"));
        this._displayUserEntry(user);
    }

    _addRoleEntry(role) {
        if (this._hasUserRoleAlready(role._id)) {
            return;
        }
        this._usersRoles.push(new Discotron.UserRole(role._id, "role"));
        this._displayRoleEntry(role);
    }

    _addEntry(name) {
        for (let i = 0; i < this._guild.members.length; ++i) {
            Discotron.User.get(this._guild.members[i]).then((user) => {
                if (user._name === name) {
                    this._addUserEntry(user);
                }
            });
        }

        if (this._displayRoles) {
            for (let i = 0; i < this._guild.roles.length; ++i) {
                Discotron.Role.get(this._guild.roles[i]).then((role) => {
                    if (role._name === name) {
                        this._addRoleEntry(role);
                    }
                });
            }
        }
    }

    _removeEntry(id, type) {
        for (let i = 0; i < this._usersRoles.length; ++i) {
            let ur = this._usersRoles[i];
            if (ur._discordId === id && ur._type === type) {
                this._usersRoles.splice(i, 1);
                break;
            }
        }

        if (!this._allowNone) {
            this._widgetContainer.querySelector(".save-button").disabled = (this._usersRoles.length === 0);
        }
    }

    _displayUserEntry(user) {
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

    _displayRoleEntry(role) {
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

    /**
     * Refresh users and role for current guild from web api
     */
    _onRefreshClick() {

    }

    /**
     * Returns true if the user or role is already present in this._usersRoles
     * @param {string} id id of the user or role
     */
    _hasUserRoleAlready(id) {
        for (let i = 0; i < this._usersRoles.length; ++i) {
            if (this._usersRoles[i]._discordId === id) {
                return true;
            }
        }
        return false;
    }
};