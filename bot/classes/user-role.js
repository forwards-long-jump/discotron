const UserRoleModel = require("./../../models/user-role.js");
const db = require("./../apis/database-crud.js");

class UserRole extends UserRoleModel {
    /**
     * Returns whether the object describes the user, or a role which the user has
     * @param {string} userDiscordId 
     * @returns {boolean} True if this userRole includes given userId 
     */
    describes(userDiscordId) {
        if (this.type === "user") {
            return this.discordId === userDiscordId;
        } else {
            // scratching of the deeskord happy eye       
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
                type: this.type
            }).then((rows) => {
                if (rows.length !== 0) {
                    resolve(rows[0].id);
                } else {
                    db.insert("UsersRoles", {
                        discordId: this.discordId,
                        type: this.type
                    });
                    resolve(this.getId());
                }
            });
        });
    }

    /**
     * Returns an instance of a database entry
     * @param {number} id ID of the database entry
     */
    static getById(id) {
        db.select("UsersRoles", ["discordId", "type"], {
            id: id
        }).then((rows) => {
            if (rows.length === 0) {
                throw new Error("UserRole inexistant in db");
            }
            return new UserRole(rows[0].discordId, rows[0].type === 1 ? "user" : "role");
        });
    }
}

module.exports = UserRole;