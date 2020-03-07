/**
 * Widget to select userRole (mostly for permissions)
 * Allows for customInputs (only checkbox are supported atm)
 */
window.discotron.UserRoleWidgetController = class extends window.discotron.WidgetController {
    /**
     * @class
     * @param {discotron.Guild} guild Guild for which we list the users and roles
     * @param {Array} usersRoles Currently selected users/roles for whatever setting this widget is needed
     * @param {Function} onUserRoleSave Callback to be called when the user is done selecting the users/roles
     * @param {boolean} displayRoles True is the widget allows choosing roles as well as users
     * @param {string} headerText Help text displayed on top
     * @param {boolean} allowNone Allows to enter no users nor roles
     * @param {Array} customInputs Array of objects for custom inputs, e.g: [{type: "input", name: ""}]
     * @param {Function} onClose Called when user cancels saving
     * @param {string} [inputHelp="Grant permission to user / role"] Text display above the name input
     */
    constructor(guild, usersRoles, onUserRoleSave, displayRoles = true, headerText = "", allowNone = false, customInputs = [], onClose = () => { }, inputHelp = "Grant permission to user / role") {
        super("user-role-selector.html", () => {
            onUserRoleSave(this._getUsersRoles(), this._getCustomSettings());
        }, () => {
            this._guild = guild;
            this._headerText = headerText;

            this._usersRoles = usersRoles.map((userRole) => {
                return new discotron.UserRole(userRole.discordUserId, userRole.discordRoleId, this._guild ? this._guild.discordId : undefined);
            });

            this._displayRoles = displayRoles;
            this._allowNone = allowNone;
            this._customInputs = customInputs;

            document.querySelector("#users-roles-container").style.display = "none";
            document.querySelector("#input-description").textContent = inputHelp;
            document.querySelector("#add-button").disabled = true;

            this._displayCustomElements();
            this._displayUserRoleSelector();
        }, onClose);

    }

    /**
     * @returns {Array} List of userRoles selected by the user
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
            customSettings[checkbox.dataset.devName] = checkbox.checked;
        }

        return customSettings;
    }


    /**
     * Handle search selector helper and more
     */
    _addEvents() {
        super._addEvents();

        let input = document.getElementById("name-input");
        let button = document.getElementById("add-button");

        input.oninput = () => {
            if (input.value !== "") {
                this._checkNameValidity(input.value);
            }
        };

        input.onpaste = (event) => {
            let paste = (event.clipboardData || window.clipboardData).getData("text");
            this._checkIdValidity(paste);
            event.preventDefault();
        };

        input.onkeydown = (e) => {
            if (e.keyCode === 13) {
                button.click();
            }
        };

        button.onclick = () => {
            button.disabled = true;
            let value = input.value;
            input.value = "";

            // The text is the name of a role or a user
            this._addEntry(value);
        };
    }

    /**
     * Activates the add button if the name corresponds to a valid discord name, or a valid user id
     * @param {string} id Id of a discord user
     */
    _checkIdValidity(id) {
        let button = document.querySelector("#add-button");
        button.disabled = true;

        // This was not an existing user, check if it's an id
        if (id.match(/^[0-9]+$/)) {
            discotron.User.get(id).then((user) => {
                document.getElementById("name-input").value = user.tag;
                button.disabled = false;
            }).catch(console.error);
        }
    }

    /**
     * Activates the add button if the name corresponds to a valid discord name, or a valid user id
     * @param {string} name Username of a discord user or role name
     */
    _checkNameValidity(name) {
        let button = document.querySelector("#add-button");
        button.disabled = true;

        if (this._guild !== undefined) {
            this._enableButtonIfValidName(this._guild, name, button);
        } else {
            // No guild specified means we are trying to add a "global" user, check in all guild just in case
            discotron.Guild.getAll().then((guilds) => {
                for (let guildId in guilds) {
                    this._enableButtonIfValidName(guilds[guildId], name, button);
                }
            });
        }

        // Also check for roles validity if they are displayed
        if (this._displayRoles) {
            this._guild.getRoles().then((roles) => {
                for (let discordId in roles) {
                    if (roles[discordId].name === name) {
                        button.disabled = false;
                        break;
                    }
                }
            }).catch(console.error);
        }
    }


    /**
     * Enable the button if the specified name (tag) is present in the guild
     * @param {discotron.Guild} guild Guild to search the username in
     * @param {string} name tag of a discord user
     * @param {object} button Element to enable/disabled
     */
    _enableButtonIfValidName(guild, name, button) {
        guild.getMembers().then((members) => {
            for (let discordId in members) {
                if (members[discordId].tag === name) {
                    button.disabled = false;
                    break;
                }
            }
        }).catch(console.error);
    }

    /**
     * Add custom elements to the widget
     */
    _displayCustomElements() {
        this._widgetContainer.querySelector(".widget-header").textContent = this._headerText;

        for (let i = 0; i < this._customInputs.length; i++) {
            const customInput = this._customInputs[i];

            switch (customInput.type) {
                case "switch": {
                    let switchTemplate = document.getElementById("template-custom-switch");
                    let switchContainer = document.importNode(switchTemplate.content, true);

                    switchContainer.querySelector(".custom-switch-checkbox").checked = customInput.value;

                    switchContainer.querySelector(".custom-switch-checkbox").placeholder = customInput.name;
                    switchContainer.querySelector(".custom-switch-checkbox").dataset.devName = customInput.devName;
                    switchContainer.querySelector(".custom-switch-title").textContent = customInput.name;

                    this._widgetContainer.querySelector(".additional-settings").appendChild(switchContainer);
                    break;
                }
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
            if (userRole.discordUserId !== null) {
                discotron.User.get(this._usersRoles[i].discordUserId).then((user) => {
                    this._displayUserEntry(user);
                }).catch(console.error);
            }
        }

        // Roles
        if (this._displayRoles) {
            for (let i = 0; i < this._usersRoles.length; ++i) {
                let userRole = this._usersRoles[i];

                if (userRole.discordRoleId !== null) {
                    this._guild.getRoles().then((roles) => {
                        for (let discordId in roles) {
                            if (roles[discordId].discordId === userRole.discordRoleId) {
                                this._displayRoleEntry(roles[discordId]);
                            }
                        }
                    });
                }
            }
        } else {
            document.querySelector("#role-container").style.display = "none";
        }

        this._handleNoUsersRolesDisplay();
    }

    /**
     * Hides or display "No users or roles" depending on this._usersRoles
     */
    _handleNoUsersRolesDisplay() {
        if (this._usersRoles.length !== 0) {
            this._widgetContainer.querySelector("#users-roles-container").style.display = "block";
            this._widgetContainer.querySelector("#no-entries").style.display = "none";
        } else {
            this._widgetContainer.querySelector("#users-roles-container").style.display = "none";
            this._widgetContainer.querySelector("#no-entries").style.display = "block";
        }
    }

    /**
     * Add user to the UserRole list
     * @param {discotron.User} user user to add
     */
    _addUserEntry(user) {
        if (this._hasUserRoleAlready(user.discordId, null)) {
            return;
        }
        this._usersRoles.push(new discotron.UserRole(user.discordId, null));

        this._displayUserEntry(user);
    }

    /**
     * Add role to the UserRole list
     * @param {discotron.Role} role role to add
     */
    _addRoleEntry(role) {
        if (this._hasUserRoleAlready(null, role.discordId)) {
            return;
        }
        this._usersRoles.push(new discotron.UserRole(null, role.discordId));

        this._displayRoleEntry(role);
    }

    /**
     * Add either a role or a user 
     * @param {string} name Tag or role name
     */
    _addEntry(name) {
        let user = discotron.User.getByTag(name);
        if (user !== undefined) {
            this._addUserEntry(discotron.User.getByTag(name));
        }

        // Check for roles as well
        if (this._displayRoles) {
            this._guild.getRoles().then((roles) => {
                for (let discordId in roles) {
                    if (roles[discordId].name === name) {
                        this._addRoleEntry(roles[discordId]);
                        break;
                    }
                }
            }).catch(console.error);
        }
    }

    /**
     * Remove a UserRole from the list
     * @param {string} userId Discord user id
     * @param {string} roleId Discord role id
     */
    _removeEntry(userId, roleId) {
        for (let i = 0; i < this._usersRoles.length; ++i) {
            let ur = this._usersRoles[i];
            if (ur._discordUserId === userId && ur._discordRoleId === roleId) {
                this._usersRoles.splice(i, 1);
                break;
            }
        }

        if (!this._allowNone) {
            this._widgetContainer.querySelector(".save-button").disabled = (this._usersRoles.length === 0);
        }

        this._handleNoUsersRolesDisplay();
    }

    /**
     * Add a user to the user list
     * @param {discotron.User} user Discord user
     */
    _displayUserEntry(user) {
        let usersContainer = document.querySelector(".user-list-container");
        let userTemplate = document.querySelector("#user-entry");

        let userEntry = document.importNode(userTemplate.content, true);
        userEntry.querySelector(".username").textContent = user._name;

        let container = userEntry.querySelector("span");
        userEntry.querySelector("span").onclick = () => {
            this._removeEntry(user.discordId, null);
            container.remove();
        };

        usersContainer.appendChild(userEntry);
        this._handleNoUsersRolesDisplay();
    }

    /**
     * Add a role to the role list
     * @param {discotron.Role} role Role
     */
    _displayRoleEntry(role) {
        let rolesContainer = document.querySelector(".role-list-container");
        let roleTemplate = document.querySelector("#role-entry");

        let roleEntry = document.importNode(roleTemplate.content, true);
        roleEntry.querySelector(".role-color").style.color = role.color;
        roleEntry.querySelector(".role").textContent = role.name;

        let container = roleEntry.querySelector("span");
        roleEntry.querySelector("span").onclick = () => {
            this._removeEntry(null, role.discordId);
            container.remove();
        };

        rolesContainer.appendChild(roleEntry);
        this._handleNoUsersRolesDisplay();
    }

    /**
     * Refresh users and role for current guild from web api
     */
    _onRefreshClick() {

    }

    /**
     * Returns true if the user or role is already present in this._usersRoles
     * @param {string} userId id of the user
     * @param {string} roleId id of the role
     * @returns {boolean} True if userId is already in the list
     */
    _hasUserRoleAlready(userId, roleId) {
        for (let i = 0; i < this._usersRoles.length; ++i) {
            if (this._usersRoles[i]._discordUserId === userId && this._usersRoles[i]._discordRoleId === roleId) {
                return true;
            }
        }
        return false;
    }
};