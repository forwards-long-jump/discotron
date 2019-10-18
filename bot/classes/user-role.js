const UserRoleModel = require("./../../models/user-role.js");
const db = require("./../apis/database-crud.js");
const Logger = require("../utils/logger.js");

/**
 * UserRole represents either a User or a Role, depending on which column is specified in the database.
 */
class UserRole extends UserRoleModel {
    /**
     * @constructor
     * @param {string} discordUserId Id of the user
     * @param {string} discordRoleId Id of the role
     * @param {string} discordGuildId Id of the guild in which this role is located. Does not apply for users
     */
    constructor(discordUserId, discordRoleId, discordGuildId) {
        super(discordUserId, discordRoleId);
        this._discordGuildId = discordGuildId;
    }

    /**
     * @returns {string} Id of the guild in which this role is located
     */
    get discordGuildId() {
        return this._discordGuildId;
    }

    /**
     * @returns {object} {discordUserId, discordRoleId} object describing the user / role
     */
    toObject() {
        return {
            discordUserId: this.discordUserId,
            discordRoleId: this.discordRoleId
        };
    }

    /**
     * @param {string} userDiscordId Discord user
     * @returns {boolean} True if this userRole includes given discord user id (same discord user id or owns the role)
     */
    describes(userDiscordId) {
        if (this.discordUserId) {
            return this.discordUserId === userDiscordId;
        } else {
            if (typeof global.discordClient !== "undefined" && typeof global.discordClient.guilds.get(this.discordGuildId) !== "undefined") {
                let role = global.discordClient.guilds.get(this.discordGuildId).roles.get(this.discordRoleId);
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
                discordUserId: this.discordUserId,
                discordRoleId: this.discordRoleId
            }).then((rows) => {
                if (rows.length !== 0) {
                    resolve(rows[0].id);
                } else {
                    return db.insert("UsersRoles", {
                        discordUserId: this.discordUserId,
                        discordRoleId: this.discordRoleId
                    }).then(() => {
                        return this.getId().then((id) => {
                            resolve(id);
                        });
                    });
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
            db.select("UsersRoles", ["discordUserId", "discordRoleId"], {
                id: id
            }).then((rows) => {
                if (rows.length === 0) {
                    throw new Error("UserRole inexistent in db");
                }
                resolve(new UserRole(rows[0].discordUserId, rows[0].discordRoleId, discordGuildId));
            }).catch(Logger.err);
        });
    }
}

module.exports = UserRole;