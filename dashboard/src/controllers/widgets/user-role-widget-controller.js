/**
 * Widget to select userRole (mostly for permissions)
 * Allows for customInputs (only checkbox are supported atm)
 */
window.Discotron.UserRoleWidgetController = class extends window.Discotron.WidgetController {
    /**
     * @constructor
     * @param {Guild} guild Guild for which we list the users and roles
     * @param {array} usersRoles Currently selected users/roles for whatever setting this widget is needed
     * @param {function} onUserRoleSave Callback to be called when the user is done selecting the users/roles
     * @param {boolean} displayRoles True is the widget allows choosing roles as well as users
     * @param {string} headerText Help text displayed on top
     * @param {boolean} allowNone Allows to enter no users nor roles
     * @param {array} customInputs Array of objects for custom inputs, e.g: [{type: "input", name: ""}]
     * @param {function} onClose Called when user cancels saving
     */
    constructor(guild, usersRoles, onUserRoleSave, displayRoles = true, headerText = "", allowNone = false, customInputs = [], onClose = () => {}) {
        super("user-role-selector.html", () => {
            onUserRoleSave(this._getUsersRoles(), this._getCustomSettings());
        }, () => {
            this._guild = guild;
            this._headerText = headerText;
            this._usersRoles = usersRoles.map((ur) => {
                return new Discotron.UserRole(ur.discordId, ur.type);
            });
            this._displayRoles = displayRoles;
            this._allowNone = allowNone;
            this._customInputs = customInputs;

            this._displayCustomElements();

            if (this._guild !== undefined) {
                document.querySelector("#add-button").disabled = true;

                let promises = [
                    this._guild._loadMembers(),
                    this._guild._loadRoles()
                ];
                Promise.all(promises).then(() => {
                    this._displayUserRoleSelector();
                }).catch(console.error);
            } else {
                this._displayUserRoleSelector();
            }

        }, onClose);

    }

    /**
     * @returns {array} List of userRoles selected by the user
     */
    _getUsersRoles() {
        return this._usersRoles;
    }

    /**
     * @returns {object} Custom settings as key -> value
     */
    _getCustomSettings() {
        // Switches
        let customSettings = {};

        let switches = this._widgetContainer.querySelectorAll(".custom-switch-checkbox");
        for (let i = 0; i < switches.length; i++) {
            const checkbox = switches[i];
            customSettings[checkbox.dataset.devname] = checkbox.checked;
        }

        return customSettings;
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

        input.onkeydown = (e) => {
            if (e.keyCode === 13) {
                button.click();
            }
        };

        button.onclick = () => {
            button.disabled = true;
            let value = input.value;
            input.value = "";
            if (this._guild === undefined) {
                // The text is a user ID, we try to send it directly
                Discotron.User.get(value).then((user) => {
                    this._addUserEntry(user);
                }).catch(console.error);
            } else {
                // The text is the name of a role or a user
                this._addEntry(value);
            }
        };
    }

    /**
     * Activates the add button if the name corresponds to 
     * @param {string} name Username of a discord user or role name
     */
    _checkNameValidity(name) {
        let button = document.querySelector("#add-button");
        button.disabled = true;

        for (let i = 0; i < this._guild.members.length; ++i) {
            Discotron.User.get(this._guild.members[i]).then((user) => {
                if (user.tag === name) {
                    button.disabled = false;
                }
            }).catch(console.error);
        }

        if (this._displayRoles) {
            for (const id in this._guild.roles) {
                const role = this._guild.roles[id];
                if (role.name === name) {
                    button.disabled = false;
                }
            }
        }
    }

    /**
     * Add custom elements to the widget
     */
    _displayCustomElements() {
        this._widgetContainer.querySelector(".widget-header").textContent = this._headerText;

        for (let i = 0; i < this._customInputs.length; i++) {
            const customInput = this._customInputs[i];

            switch (customInput.type) {
                case "switch":
                    let switchTemplate = document.getElementById("template-custom-switch");
                    let switchContainer = document.importNode(switchTemplate.content, true);

                    switchContainer.querySelector(".custom-switch-checkbox").checked = customInput.value;

                    switchContainer.querySelector(".custom-switch-checkbox").placeholder = customInput.name + "lonle";
                    switchContainer.querySelector(".custom-switch-checkbox").dataset.devname = customInput.devname;
                    switchContainer.querySelector(".custom-switch-title").textContent = customInput.name;

                    this._widgetContainer.querySelector(".additional-settings").appendChild(switchContainer);
                    break;
            }
        }

        if (this._customInputs.length > 0) {
            this._widgetContainer.querySelector(".additional-settings-spacer").style.display = "block";
        }
    }

    /**
     * Display user and roles on the widget
     */
    _displayUserRoleSelector() {

        // Users
        for (let i = 0; i < this._usersRoles.length; ++i) {
            let userRole = this._usersRoles[i];
            if (userRole.type === "user") {
                Discotron.User.get(this._usersRoles[i].discordId).then((user) => {
                    this._displayUserEntry(user);
                }).catch(console.error);
            }
        }

        // Roles
        if (this._displayRoles) {
            for (let i = 0; i < this._usersRoles.length; ++i) {
                let userRole = this._usersRoles[i];
                if (userRole.type === "role") {
                    let role = this._guild.roles[userRole.discordId];
                    this._displayRoleEntry(role);
                }
            }
        } else {
            document.querySelector("#role-container").style.display = "none";
        }
    }

    /**
     * Add user to the UserRole list
     * @param {User} user user to add
     */
    _addUserEntry(user) {
        if (this._hasUserRoleAlready(user._id)) {
            return;
        }
        this._usersRoles.push(new Discotron.UserRole(user._id, "user"));
        this._displayUserEntry(user);
    }

    /**
     * Add role to the UserRole list
     * @param {Role} role role to add
     */
    _addRoleEntry(role) {
        if (this._hasUserRoleAlready(role._id)) {
            return;
        }
        this._usersRoles.push(new Discotron.UserRole(role._id, "role"));
        this._displayRoleEntry(role);
    }

    /**
     * Add either a role or a username 
     * @param {string} name Username or role name
     */
    _addEntry(name) {
        for (let i = 0; i < this._guild.members.length; ++i) {
            Discotron.User.get(this._guild.members[i]).then((user) => {
                if (user.tag === name) {
                    this._addUserEntry(user);
                }
            }).catch(console.error);
        }

        if (this._displayRoles) {
            for (const id in this._guild.roles) {
                const role = this._guild.roles[id];
                if (role._name === name) {
                    this._addRoleEntry(role);
                }
            }
        }
    }

    /**
     * Remove a user or a role from the list
     * @param {string} id Discord id
     * @param {string} type "role" or "user"
     */
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

    /**
     * Add a user to the user list
     * @param {User} user 
     */
    _displayUserEntry(user) {
        let usersContainer = document.querySelector(".user-list-container");
        let userTemplate = document.querySelector("#user-entry");

        let userEntry = document.importNode(userTemplate.content, true);
        userEntry.querySelector(".username").textContent = user._name;

        let container = userEntry.querySelector("span");
        userEntry.querySelector("span").onclick = () => {
            this._removeEntry(user._id, "user");
            container.remove();
        };

        usersContainer.appendChild(userEntry);
    }

    /**
     * Add a role to the role list
     * @param {Role} role 
     */
    _displayRoleEntry(role) {
        let rolesContainer = document.querySelector(".role-list-container");
        let roleTemplate = document.querySelector("#role-entry");

        let roleEntry = document.importNode(roleTemplate.content, true);
        roleEntry.querySelector(".role-color").style.color = role.color;
        roleEntry.querySelector(".role").textContent = role.name;

        let container = roleEntry.querySelector("span");
        roleEntry.querySelector("span").onclick = () => {
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