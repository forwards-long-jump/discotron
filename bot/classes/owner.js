const OwnerModel = require("./../../models/owner.js");
const webAPI = require("./../apis/web-api.js").getWebAPI("discotron-dashboard");
const db = require("./../apis/database-crud.js");

class Owner extends OwnerModel {
    /**
     * Adds an owner
     * @param {string} discordUserId 
     */
    static add(discordUserId) {
        Owner._owners.add(discordUserId);
        db.insert("Owners", {
            discordUserId: discordUserId
        });

    }

    /**
     * Removes an owner. Note: does nothing if removing the owner leaves the bot an orphan
     * @param {string} discordUserId 
     */
    static remove(discordUserId) {
        Owner._owners.delete(discordUserId);
        db.select("Owners").then((rows) => {
            if (rows.length > 1) {
                db.delete("Owners", {
                    discordUserId: discordUserId
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
        return Owner._owners.has(discordUserId);
    }

    static registerActions() {
        webAPI.registerAction("add-owner", (data, reply) => {
            Owner.add(data.discordUserId);
        }, "owner");
        webAPI.registerAction("remove-owner", (data, reply) => {
            Owner.remove(data.discordUserId);
        }, "owner");
        webAPI.registerAction("get-owners", (data, reply) => {
            reply(Owner._owners);
        }, "owner");
        webAPI.registerAction("is-owner", (data, reply) => {
            reply(Owner.isOwner(data.discordUserId));
        });
    }
}

Owner._owners = new Set([]);

module.exports = Owner;