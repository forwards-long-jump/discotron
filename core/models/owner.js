const OwnerModel = require("./../../shared-models/owner.js");
const webAPI = require("../../dashboard/backend/api.js").getWebAPI("discotron-dashboard");
const db = require("./../database/crud.js");
const Logger = require("../utils/logger.js");

/**
 * An owner is the person who hosts the Discotron bot or people who were given owner permission
 */
class Owner extends OwnerModel {
    /**
     * Set the owners. The given array must not be empty, otherwise nothing will happen
     * @static
     * @param {Array} discordUserIds Array of discord user id
     * @returns {void} 
     */
    static setOwners(discordUserIds) {
        if (discordUserIds.length === 0) {
            return;
        }

        Owner._owners = new Set(discordUserIds);

        db.delete("Owners", {}, true).then(() => {
            let promises = [];

            for (let i = 0; i < discordUserIds.length; ++i) {
                promises.push(db.insert("Owners", {
                    discordUserId: discordUserIds[i]
                }));
            }

            return Promise.all(promises);
        }).catch(Logger.err);
    }

    /**
     * @static
     * @param {string} discordUserId Discord user id
     * @returns {boolean} True if user is owner
     */
    static isOwner(discordUserId) {
        return discordUserId !== undefined && Owner._owners.has(discordUserId);
    }

    /**
     * Register webAPI actions related to owners
     * @static
     */
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

    /**
     * @static
     * @returns {Promise} resolve(owners {array}) owners: Array of discord user id, reject(error {string})
     */
    static getOwners() {
        return new Promise((resolve, reject) => {
            if (Owner._owners.size === 0) {
                return db.select("Owners").then((rows) => {
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