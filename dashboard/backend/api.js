const Logger = require("../../core/utils/logger.js");
const Login = require("../../core/login.js");
const { isOwner } = require("../../core/models/owner.js");
const { isGuildAdmin } = require("../../core/models/guild.js");
const { readRecursive } = require("../../core/utils/file-helper.js");

const WebApiError = require("../../shared/webapi-error.js");

const authenticationRequirements = {
    "owner": {
        useUserId: true
    },
    "guildAdmin": {
        useUserId: true
    },
    "loggedIn": {
        useUserId: true
    },
    "everyone": {
        useUserId: false
    },
};

/**
 * Action to run when an endpoint is called.
 * @callback EndpointAction
 * @param {object} userData Data passed to the API by the user.
 * @param {object} trustedData Data which is verified by the API to be valid before being passed here.
 * This for example includes the Discord user's ID, which is retrieved from a valid AppToken.
 */
/**
 * Returns a function which is used for handling an API request
 * @param {object} endpoint The endpoint information.
 * @param {EndpointAction} endpoint.action Action to run when endpoint is called.
 * @param {object} options Options.
 * @param {boolean} options.mustReturn Whether the action must return a value, otherwise an error would be thrown.
 * Useful for GET, where a value is always expected by the client.
 * @returns {Function} Express.JS callback.
 */
function createEndpointHandler(endpoint, { mustReturn = false } = {}) {
    return async (req, res) => {
        /**
         * Send a reply to client.
         * @param {object} object Object.
         * @param {object} object.data User data.
         * @param {WebApiError} object.error Error object.
         * @param {number} [object.status] Status code
         */
        function reply({ data, error, status = 200 } = {}) {
            res.status(status).json({
                data: data,
                error: error && error.serialize()
            });
        }

        if (endpoint === undefined) {
            // Endpoint is undefined for this verb
            Logger.warn("[WebAPI] Endpoint __" + req.url + "__ accessed with incompatible HTTP verb");
            reply({
                status: 405, /* Method Not Allowed */
                error: new WebApiError("Endpoint " + req.url + " accessed with incompatible HTTP verb", WebApiError.coreErrors.INVALID_VERB)
            });
            return;
        }

        Logger.debug("[WebAPI] " + req.method + " " + req.url);

        let appToken;
        const authorizationHeader = req.header("Authorization");
        const authorizationPrefix = "Bearer ";

        if (typeof authorizationHeader === "string" && authorizationHeader.startsWith(authorizationPrefix)) {
            appToken = authorizationHeader.slice(authorizationPrefix.length);
        }

        let userData = {};

        if (req.method === "GET") {
            userData = req.query;
        } else {
            userData = req.body;
        }

        if (typeof userData !== "object" && typeof userDate !== "undefined") {
            Logger.warn("[WebAPI] User sent non-object userData.");
            reply({ status: 400, error: new WebApiError("UserData must always be specified as an object.", WebApiError.coreErrors.INVALID_USERDATA) });
            return;
        }

        let trustedData = {};

        try {
            // If trusted data can't be established (e.g. not logged in), an error is thrown
            trustedData = await getTrustedData(appToken, userData, endpoint.authentication);
        } catch (err) {
            if (err instanceof WebApiError) {
                Logger.warn("[WebAPI] Insufficient permission to execute " + req.url + " (authentication was set to " + endpoint.authentication + ").");
                reply({ status: 401, error: err });
                return;
            } else {
                // Unexpected exceptions should be re-thrown
                Logger.err("Unexpected exception in WebAPI getTrustedData", err);
                reply({ status: 500, error: new WebApiError("WebAPI server had an unexpected error.", WebApiError.coreErrors.UNEXPECTED) });
                throw err;
            }
        }

        let returnValue;
        try {
            // Execute the action and store its return value
            // Resolves both values and (chained) promises to its final return value
            returnValue = await Promise.resolve(endpoint.action(userData, trustedData));
        } catch (err) {
            if (err instanceof WebApiError) {
                if (WebApiError.getCoreErrors().includes(err.codeName)) {
                    // Endpoint returns core error, not allowed!
                    const errorMessage = "WebAPI endpoint action returned a core error code " + err.codeName + ". These may only be thrown from core WebAPI code!";
                    Logger.err(errorMessage);
                    reply({ status: 500, error: new WebApiError("Discotron encountered an unexpected error. This issue should be reported to the owner of this bot.", WebApiError.coreErrors.RTFM) });
                    throw new Error(errorMessage);
                }
                reply({ status: 400, error: err });
                return;
            } else {
                // Unexpected exceptions should be re-thrown
                Logger.err("Unexpected exception in WebAPI endpoint action", err);
                reply({ status: 500, error: new WebApiError("Discotron encountered an unexpected error. Try again later.", WebApiError.coreErrors.UNEXPECTED) });
                throw err;
            }
        }

        // Missing required return value is a developer error
        if (mustReturn && returnValue === undefined) {
            const errorMessage = "Endpoint " + req.url + " was set to mustReturn (HTTP " + req.method + "), but it did not!";
            Logger.err(errorMessage);
            reply({ status: 500, error: new WebApiError("Discotron encountered an unexpected error. This issue should be reported to the owner of this bot.", WebApiError.coreErrors.RTFM) });
            throw new Error(errorMessage);
        }

        // Answer client with the return value
        reply({ data: returnValue, timeToLive: endpoint.timeToLive });
    };
}


/**
 * Uses appToken to verify that the user is authenticated and have access to the resource wanted by 
 * Throws an exception if the data can't be trusted, or the authentication mode is unknown.
 * @param {string} appToken User's appToken.
 * @param {object} untrustedData Untrusted data provided by user. May be modified when trusting data.
 * @param {string} authentication Auth mode, should be one of *authenticationRequirements* keys.
 * @returns {Promise<object>} The trusted data.
 */
async function getTrustedData(appToken, untrustedData, authentication) {
    const trustedData = {};

    // If userId is required, we check and set it
    if (authenticationRequirements[authentication].useUserId) {
        // Retrieve from appToken
        const discordUserId = await Login.getDiscordUserId(appToken);

        if (!discordUserId) {
            throw new WebApiError("Invalid app token.", WebApiError.coreErrors.AUTHENTICATION_INVALID_APP_TOKEN);
        }

        trustedData.userId = discordUserId;
    }

    switch (authentication) {
        case "owner":
            // Is the dude owner of discotron?
            if (!isOwner(trustedData.userId)) {
                throw new WebApiError("Permission denied.", WebApiError.coreErrors.AUTHENTICATION_NOT_OWNER);
            }
            break;
        case "guildAdmin":
            // Is the dude associated to the userId admin of the untrusted guild id?
            if (!isGuildAdmin(trustedData.userId, untrustedData.guildId)) {
                throw new WebApiError("You are not an admin of that guild.", WebApiError.coreErrors.AUTHENTICATION_NOT_GUILD_ADMIN);
            }

            // We now trust the guildId
            trustedData.guildId = untrustedData.guildId;
            delete untrustedData.guildId;
            break;
        case "loggedIn": /* trustedData.userId is set above */ break;
        case "everyone": /* This is always true */ break;
        default: {
            throw new Error("Unknown authentication mode specified: " + authentication);
        }
    }

    return trustedData;
}

// REMOVE ME LATER!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
module.exports.getWebAPI = () => ({ registerAction: (...a) => { 
    Logger.err("Unconverted web api:", ...a);
} });

module.exports.registerEndpoints = (app) => {
    const sourceDir = __dirname + "/endpoints/";
    const scope = "dashboard";
    const files = readRecursive(sourceDir);

    // Go through all endpoints and parse the objects
    const verbOptions = {
        "get": { mustReturn: true },
        "post": {},
        "put": {},
        "delete": {}
    };

    for (const file of files) {
        const endpoint = require(file);
        const url = file.slice(sourceDir.length, -3); // -3 is length of the .js suffix

        for (const verb in verbOptions) {
            app[verb](`/api/${scope}/${url}`, createEndpointHandler(endpoint[verb], verbOptions[verb]));
        }
    }
};
