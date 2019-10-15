/**
 * Represent a bot owner
 */
class OwnerModel {
    /**
     * @constructor
     * @param  {string} discordId DiscordId of the owner
     */
    constructor(discordId = undefined) {
        this._discordId = discordId;
    }

    /**
     * @returns {string} Discord Id
     */
    get discordId() {
        return this._discordId;
    }
}


if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
    module.exports = OwnerModel;
} else {
    window.Discotron.OwnerModel = OwnerModel;
}