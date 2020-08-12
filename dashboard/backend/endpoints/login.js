const { login } = require("../../../core/login.js");
const WebApiError = require("../../../shared/webapi-error.js");

/**
 * Log in user given OAuth token.
 * Errors: `login-error`
 */
module.exports.post = {
    authentication: "everyone",
    action: async (userData) => {
        const result = await login(userData.authToken);
        if (result.success) {
            return result.data;
        }
        throw new WebApiError("Unable to login", "login-error");
    }
};
