const OwnerModel = require(__dirname + "/../models/owner.js");

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
}

Owner.prototype._owners = [];