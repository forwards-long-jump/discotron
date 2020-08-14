class WebApiError extends Error {
    /**
     * @param {string} message Error message for user
     * @param {string} codeName Error code to identify the type of error
     */
    constructor(message, codeName) {
        super(message);

        this._codeName = codeName;
    }

    /**
     * Gets an error code which can be used to identify the type of error
     * @returns {string} Error code string
     */
    get codeName() {
        return this._codeName;
    }

    serialize() {
        return {
            message: this.message,
            codeName: this.codeName
        };
    }

    static deserialize(error) {
        return new WebApiError(error.message, error.codeName);
    }

    static handleErrors(error, handlers = {}) {
        if (error instanceof WebApiError) {
            const handler = handlers[error.codeName];

            // Check if contained by the handlers
            if (typeof handler === "function") {
                // Call handler
                handler();
                return;
            }
        }

        // Rethrow unexpected exception types / codeNames
        throw error;
    }

    /**
     * Gets list of core error codes
     * @returns {Array} Core error codes
     */
    static getCoreErrors() {
        return Object.values(WebApiError.coreErrors);
    }

    toString() {
        return super.toString() + " - Error code: " + this.codeName;
    }
}

/**
 * Gets list of possible core errors
 * @returns {object} Core errors enum
 */
WebApiError.coreErrors = {
    /**
     * User is not logged in to Discotron
     * @returns {string} Error code string
     */
    AUTHENTICATION_INVALID_APP_TOKEN: "_core-authentication-invalid-app-token",
    /**
     * User is not authenticated as a bot owner
     * @returns {string} Error code string
     */
    AUTHENTICATION_NOT_OWNER: "_core-authentication-not-owner",
    /**
     * User is not authenticated as a guild admin
     * @returns {string} Error code string
     */
    AUTHENTICATION_NOT_GUILD_ADMIN: "_core-authentication-not-guild_admin",
    /**
     * Unexpected exception has occurred
     * @returns {string} Error code string
     */
    UNEXPECTED: "_core-unexpected-error",
    /**
     * Connection error between client and server occurred
     * @returns {string} Error code string
     */
    CONNECTION: "_core-connection-error",
    /**
     * Invalid HTTP verb was used to access the endpoint
     * @returns {string} Error code string
     */
    INVALID_VERB: "_core-invalid-verb",
    /**
     * Endpoint of Discotron or plugin is not configured according to the documentation
     * If you find a better name, please change it, we don't want to be rude
     * @returns {string} Error code string
     */
    RTFM: "_core-dumb-devs",
    /**
     * User sent invalid data to the server
     * @returns {string} Error code string
     */
    INVALID_USERDATA: "_core-invalid-userdata",
};

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
    module.exports = WebApiError;
} else {
    window.discotron.WebApiError = WebApiError;
}
