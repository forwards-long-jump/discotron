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

    static getCoreErrors() {
        // TODO: This can be cached
        // Source: https://stackoverflow.com/a/39310917
        return Object.entries(Object.getOwnPropertyDescriptors(WebApiError))
            .filter(([key, descriptor]) => typeof descriptor.get === "function" && key.startsWith("ERROR_"))
            .map(([key, descriptor]) => descriptor.get());
    }

    /**
     * User is not logged in to Discotron
     * @returns {string} Error code string
     */
    static get ERROR_AUTHENTICATION_INVALID_APP_TOKEN() {
        return "authentication-invalid-app-token";
    }

    /**
     * User is not authenticated as a bot owner
     * @returns {string} Error code string
     */
    static get ERROR_AUTHENTICATION_NOT_OWNER() {
        return "authentication-not-owner";
    }

    /**
     * User is not authenticated as a guild admin
     * @returns {string} Error code string
     */
    static get ERROR_AUTHENTICATION_NOT_GUILD_ADMIN() {
        return "authentication-not-guild-admin";
    }

    /**
     * Unexpected exception has occurred
     * @returns {string} Error code string
     */
    static get ERROR_UNEXPECTED() {
        return "unexpected-error";
    }

    /**
     * Connection error between client and server occurred
     * @returns {string} Error code string
     */
    static get ERROR_CONNECTION() {
        return "connection-error";
    }

    /**
     * Invalid HTTP verb was used to access the endpoint
     * @returns {string} Error code string
     */
    static get ERROR_INVALID_VERB() {
        return "invalid-verb";
    }
}

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
    module.exports = WebApiError;
} else {
    window.discotron.WebApiError = WebApiError;
}
