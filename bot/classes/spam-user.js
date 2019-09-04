const config = require("../config/config.json");

class SpamUser {
    constructor(discordUser) {
        this._damageTaken = 0;
        this._dead = false;
        this._lastActionTime = 0;
        this._deathTime = 0;
        this._discordUser = discordUser;

        SpamUser._users[discordUser.id] = this;
    }

    static isRestricted(user) {
        if (SpamUser._users[user.id] !== undefined) {
            return SpamUser._users[user.id]._isDead();
        } else {
            new SpamUser(user);
            return false;
        }
    }

    static onAction(user) {
        if (SpamUser._users[user.id] !== undefined) {
            SpamUser._users[user.id]._dealDamage();
        } else {
            new SpamUser(user);
            SpamUser._users[user.id]._dealDamage();
        }
    }

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
            this._discordUser.send("Please do not spam commands, you now have to wait " + config.spam.timePenalityInSeconds + " seconds before posting again.");
        }
    }

    _isDead() {
        if (this._dead) {
            let currentTime = (new Date().getTime() / 1000);
            if (currentTime - this._deathTime > config.spam.timePenalityInSeconds) {
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