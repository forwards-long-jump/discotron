const { claimOwnership, isBotOwned, printOwnershipCode } = require("../../../../core/login.js");
const WebApiError = require("../../../../shared/webapi-error.js");

/**
 * Check bot ownership status (print the code in the console if not owned)
 */
module.exports.get = {
    authentication: "loggedIn",
    action: () => {
        if (isBotOwned()) {
            return true;
        } else {
            printOwnershipCode();
            return false;
        }
    }
};

/**
 * Claim ownership of the bot, given the ownership code from console
 * Errors: `wrong-secret|has-bot-owner|unexpected`
 */
module.exports.post = {
    authentication: "loggedIn",
    action: (userData, trustedData) => {
        const result = claimOwnership(userData.secret, trustedData.userId);
        switch (result) {
            case "wrong-secret":
                throw new WebApiError("Wrong ownership code specified.", "wrong-secret");
            case "has-bot-owner":
                throw new WebApiError("Bot already has an owner.", "has-bot-owner");
            case "success":
                break;
            default:
                throw new WebApiError("Could not claim ownership.", "unexpected");
        }
    }
};
