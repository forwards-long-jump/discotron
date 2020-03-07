const config = require("../config.json");

/**
 * Handle spam limitations per users
 */
class SpamUser {
    /**
     * @class
     * @param {DiscordJS.User} discordUser User managed by this class
     */
    constructor(discordUser) {
        this._damageTaken = 0;
        this._dead = false;
        this._lastActionTime = 0;
        this._deathTime = 0;
        this._discordUser = discordUser;

        SpamUser._users[discordUser.id] = this;
    }

    /**
     * @static
     * @param {DiscordJS.User} discordUser DiscordJS user
     * @returns {boolean} True if the user has spammed too much and is being restricted
     */
    static isRestricted(discordUser) {
        if (SpamUser._users[discordUser.id] !== undefined) {
            return SpamUser._users[discordUser.id]._isDead();
        } else {
            new SpamUser(discordUser);
            return false;
        }
    }

    /**
     * Should be called when a user performs an action which is spam restricted
     * @static
     * @param {DiscordJS.User} discordUser DiscordJS user
     */
    static onAction(discordUser) {
        if (SpamUser._users[discordUser.id] !== undefined) {
            SpamUser._users[discordUser.id]._dealDamage();
        } else {
            new SpamUser(discordUser);
            SpamUser._users[discordUser.id]._dealDamage();
        }
    }

    /**
     * "Damages" the user every time a spam restricted action is performed
     * when the user has no "health" left, he "dies"
     */
    _dealDamage() {
        if (this._dead) {
            return;
        }

        // Calculate regeneration
        let currentTime = (new Date().getTime() / 1000);

        this._damageTaken -= (currentTime - this._lastActionTime) * config.spam.decrementPerSecond;
        this._damageTaken = Math.max(0, this._damageTaken);
        this._lastActionTime = currentTime;

        // Deal damage
        this._damageTaken += config.spam.incrementPerUsage;

        // Dies
        if (this._damageTaken > config.spam.spamThreshold) {
            this._deathTime = currentTime;
            this._dead = true;
            this._discordUser.send("Please do not spam commands, you now have to wait " + config.spam.timePenaltyInSeconds + " seconds before posting again.");
        }
    }

    /**
     * Applies "health regeneration" and return if the user is still "dead"
     * @returns {boolean} True if the user spammed too much
     */
    _isDead() {
        if (this._dead) {
            let currentTime = (new Date().getTime() / 1000);
            if (currentTime - this._deathTime > config.spam.timePenaltyInSeconds) {
                this._dead = false;
                this._damageTaken = 0;
                return false;
            } else {
                return true;
            }
        } else {
            return false;
        }
    }
}

SpamUser._users = {};
module.exports = SpamUser;