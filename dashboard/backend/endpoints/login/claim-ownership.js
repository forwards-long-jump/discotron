const { claimOwnership } = require("../../../../core/login.js");
const WebApiError = require("../../../../shared/webapi-error.js");

module.exports.POST = {
    authLevel: "loggedIn",
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
