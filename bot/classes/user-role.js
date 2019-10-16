const UserRoleModel = require("./../../models/user-role.js");
const db = require("./../apis/database-crud.js");
const Logger = require("../utils/logger.js");

/**
 * UserRole represents either a User or a Role.
 * It was a bad idea and should not exists, it was created to avoid storing discord user ids and discord role ids separetely
 * since most permissions allows either a user or a role
 */
class UserRole extends UserRoleModel {
    /**
     * @constructor
     * @param {string} discordId Id of the user or role
     * @param {string} type Type of the id, "user" or "role"
     * @param {string} discordGuildId Id of the guild in which this role is located. Does not apply for users
     */
    constructor(discordId, type, discordGuildId) {
        super(discordId, type);
        this._discordGuildId = discordGuildId;
    }

    /**
     * @returns {string} Id of the guild in which this role is located
     */
    get discordGuildId() {
        return this._discordGuildId;
    }

    /**
     * @returns {object} {id, type} object describing the user / role
     */
    toObject() {
        return {
            id: this.discordId,
            type: this.type
        };
    }

    /**
     * @param {string} userDiscordId Discord user
     * @returns {boolean} True if this userRole includes given discord user id (same discord user id or owns the role)
     */
    describes(userDiscordId) {
        if (this.type === "user") {
            return this.discordId === userDiscordId;
        } else {
            if (typeof global.discordClient !== "undefined" && typeof global.discordClient.guilds.get(this.discordGuildId) !== "undefined") {
                let role = global.discordClient.guilds.get(this.discordGuildId).roles.get(this.discordId);
                return role.members.has(userDiscordId);
            } else {
                return false;
            }
        }
    }

    /**
     * Creates an entry if there isn't one
     * @returns {number} Id of the database entry for this UserRole
     */
    getId() {
        return new Promise((resolve, reject) => {
            db.select("UsersRoles", ["id"], {
                discordId: this.discordId,
                type: (this.type === "user" ? 1 : 2)
            }).then((rows) => {
                if (rows.length !== 0) {
                    resolve(rows[0].id);
                } else {
                    db.insert("UsersRoles", {
                        discordId: this.discordId,
                        type: (this.type === "user" ? 1 : 2)
                    }).then(() => {
                        this.getId().then((id) => {
                            resolve(id);
                        }).catch(Logger.err);
                    }).catch(Logger.err);
                }
            }).catch(Logger.err);
        });
    }

    /**
     * Query the database to get a role using its id
     * TODO: This function only creates n + 1 problems and should be removed!
     * @static
     * @param {number} id Id of the database entry
     * @param {string} discordGuildId Id of the guild in which the user/role exists
     */
    static getById(id, discordGuildId) {
        return new Promise((resolve, reject) => {
            db.select("UsersRoles", ["discordId", "type"], {
                id: id
            }).then((rows) => {
                if (rows.length === 0) {
                    throw new Error("UserRole inexistant in db");
                }
                resolve(new UserRole(rows[0].discordId, rows[0].type === 1 ? "user" : "role", discordGuildId));
            }).catch(Logger.err);
        });
    }
}

module.exports = UserRole;