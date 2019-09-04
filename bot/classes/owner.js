const OwnerModel = require("./../../models/owner.js");
const webAPI = require("./../apis/web-api.js").getWebAPI("discotron-dashboard");
const db = require("./../apis/database-crud.js");

class Owner extends OwnerModel {
    /**
     * Set the owners. The given array must not be empty, else nothing will happen
     * @param {array} discordUserId Array of user ids 
     */
    static setOwners(discordUserIds) {
        if (discordUserIds.length === 0) {
            return;
        }

        Owner._owners = new Set(discordUserIds);

        db.delete("Owners", {}, true).then(() => {
            for (let i = 0; i < discordUserIds.length; ++i) {
                db.insert("Owners", {
                    discordUserId: discordUserIds[i]
                });
            }
        });
    }

    /**
     * Returns whether the given client is an owner
     * @param {string} discordUserId 
     * @returns True if user is owner
     */
    static isOwner(discordUserId) {
        return discordUserId !== undefined && Owner._owners.has(discordUserId);
    }

    static registerActions() {
        webAPI.registerAction("set-owners", (data, reply) => {
            Owner.setOwners(data.discordUserIds);
            reply();
        }, "owner");
        webAPI.registerAction("get-owner-ids", (data, reply) => {
            reply(Array.from(Owner._owners));
        }, "owner");
        webAPI.registerAction("is-owner", (data, reply, discordUserId) => {
            reply(Owner.isOwner(discordUserId));
        });
    }

    static getOwners() {
        return new Promise((resolve, reject) => {
            if (Owner._owners.size === 0) {
                db.select("Owners").then((rows) => {
                    for (let i = 0; i < rows.length; i++) {
                        const row = rows[i];
                        Owner._owners.add(row.discordUserId);
                    }
                    resolve(Array.from(Owner._owners));
                });
            } else {
                resolve(Array.from(Owner._owners));
            }
        });
    }
}

Owner._owners = new Set([]);

module.exports = Owner;