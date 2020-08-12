class WebApiError extends Error {
    /**
     * @param {string} message Error message for user.
     * @param {string} codeName Error code to compare on client
     */
    constructor(message, codeName) {
        super(message);

        this._codeName = codeName;
    }

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
}

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
    module.exports = WebApiError;
} else {
    window.discotron.WebApiError = WebApiError;
}
