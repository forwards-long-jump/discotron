const UserRoleModel = require("./../../models/user-role.js");
const db = require("./../apis/database-crud.js");

class UserRole extends UserRoleModel {
    /**
     * Ctor
     * @param {string} discordId ID of the user or role
     * @param {string} type Type of the id, "user" or "role"
     * @param {string} discordId ID of the guild in which this user / role is located
     */
    constructor(discordId, type, guildId) {
        super(discordId, type);
        this._guildId = guildId;
    }

    /**
     * Get guildId
     */
    get guildId() {
        return this._guildId;
    }

    /**
     * Returns an object describing the user / role
     * @returns {object} {id, type}
     */
    toObject() {
        return {
            id: this.discordId,
            type: this.type
        };
    }
    /**
     * Returns whether the object describes the user, or a role which the user has
     * @param {string} userDiscordId 
     * @returns {boolean} True if this userRole includes given userId 
     */
    describes(userDiscordId) {
        if (this.type === "user") {
            return this.discordId === userDiscordId;
        } else {
            let role = global.discordClient.guilds.get(this.guildId).roles.get(this.discordId);
            return role.members.has(userDiscordId);
        }
    }

    /**
     * Returns the ID from the database. Creates an entry if there isn't one
     * @returns {number} ID of the database entry for this UserRole
     */
    getId() {
        return new Promise((resolve, reject) => {
            db.select("UsersRoles", ["id"], {
                discordId: this.discordId,
                type: (this.type === "user" ?  1 : 2)
            }).then((rows) => {
                if (rows.length !== 0) {
                    resolve(rows[0].id);
                } else {
                    db.insert("UsersRoles", {
                        discordId: this.discordId,
                        type: (this.type === "user" ?  1 : 2)
                    }).then(() => {
                        this.getId().then((id) => {
                            resolve(id);
                        });
                    });
                }
            });
        });
    }

    /**
     * Returns an instance of a database entry
     * @param {number} id ID of the database entry
     * @param {string} guildId ID of the guild in which the user/role exists
     */
    static getById(id, guildId) {
        return new Promise((resolve, reject) => {
            db.select("UsersRoles", ["discordId", "type"], {
                id: id
            }).then((rows) => {
                if (rows.length === 0) {
                    throw new Error("UserRole inexistant in db");
                }
                resolve(new UserRole(rows[0].discordId, rows[0].type === 1 ? "user" : "role", guildId));
            });
        });
    }
}

module.exports = UserRole;