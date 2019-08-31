const OwnerModel = require("./../../models/owner.js");
const webAPI = require("./../apis/web-api.js").getWebAPI("discotron-dashboard");

class Owner extends OwnerModel {
    /**
     * Adds an owner
     * @param {string} discordUserId 
     */
    static add(discordUserId) {

    }

    /**
     * Removes an owner. Note: does nothing if removing the owner leaves the bot an orphan
     * @param {string} discordUserId 
     */
    static remove(discordUserId) {

    }

    /**
     * Returns whether the given client is an owner
     * @param {string} discordUserId 
     * @returns True if user is owner
     */
    static isOwner(discordUserId) {

    }

    /**
     * @returns True if an owner exists in the database
     */
    static hasAnyOwner() {

    }

    static registerActions() {
        webAPI.registerAction("add-owner", (data, reply) => {}, "owner");
        webAPI.registerAction("remove-owner", (data, reply) => {}, "owner");
        webAPI.registerAction("get-owners", (data, reply) => {}, "owner");
        webAPI.registerAction("is-owner", (data, reply) => {});
        webAPI.registerAction("has-any-owner", (data, reply) => {});
    }
}

Owner.prototype._owners = [];

module.exports = Owner;