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
         * @param {string} [object.source] Check on the client to determine who threw this error on the server side.
         * Can either be *endpoint* if the api endpoint threw it, or *core* if the WebApi threw this error.
         */
        function reply({ data, error, source = "core", status = 200 } = {}) {
            res.status(status).json({
                data: data,
                error: error && error.serialize(),
                source: source
            });
        }

        if (endpoint === undefined) {
            // Endpoint is undefined for this verb
            Logger.log("[WebAPI] Endpoint __" + req.url + "__ accessed with incompatible HTTP verb", "warn");
            reply({
                status: 405, /* Method Not Allowed */
                error: new WebApiError("Endpoint " + req.url + " accessed with incompatible HTTP verb", "invalid-verb")
            });
            return;
        }

        Logger.log("[WebAPI] Accessing " + req.url);

        let appToken;
        const authorizationHeader = req.header("authorization");

        if (typeof authorizationHeader === "string" && authorizationHeader.startsWith("Bearer ")) {
            appToken = authorizationHeader.slice(7);
        }

        let userData = {};

        if (req.method === "GET") {
            // We except GET query params to be JSON encoded
            try {
                for (const key in req.query) {
                    userData[key] = JSON.parse(req.query[key]);
                }
            } catch (err) {
                reply({ status: 400, error: new WebApiError("GET endpoint excepts values to be JSON encoded", "get-params-not-json-encoded"), source: "core" });
                return;
            }
        } else {
            userData = req.body.data;
        }

        let trustedData = {};

        try {
            // If trusted data can't be established (e.g. not logged in), an error is thrown
            trustedData = await getTrustedData(appToken, userData, endpoint.authentication);
        } catch (err) {
            if (err instanceof WebApiError) {
                Logger.log("[WebAPI] Insufficient permission to execute " + req.url + " (authentication was set to " + endpoint.authentication + ").", "warn");
                reply({ status: 401, error: err });
                return;
            } else {
                // Unexpected exceptions should be re-thrown
                reply();
                throw err;
            }
        }

        try {
            const returnValue = endpoint.action(userData, trustedData);
            if (mustReturn && returnValue === undefined) {
                throw new Error("Endpoint " + req.url + " was set to mustReturn (most likely a HTTP GET), but it did not!");
            }
            reply({ data: returnValue, timeToLive: endpoint.timeToLive });
        } catch (err) {
            if (err instanceof WebApiError) {
                reply({ status: 400, error: err, source: "endpoint" });
                return;
            } else {
                // Unexpected exceptions should be re-thrown
                reply();
                throw err;
            }
        }
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
            throw new WebApiError("Invalid app token.", "authentication-invalid-app-token");
        }

        trustedData.userId = discordUserId;
    }

    switch (authentication) {
        case "owner":
            // Is the dude owner of discotron?
            if (!isOwner(trustedData.userId)) {
                throw new WebApiError("Permission denied.", "authentication-not-owner");
            }
            break;
        case "guildAdmin":
            // Is the dude associated to the userId admin of the untrusted guild id?
            if (!isGuildAdmin(trustedData.userId, untrustedData.guildId)) {
                throw new WebApiError("You are not an admin of that guild.", "authentication-not-guild-admin");
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
module.exports.getWebAPI = () => ({ registerAction: () => { } });

module.exports.registerActions = (app) => {
    const sourceDir = __dirname + "/endpoints/";
    const scope = "dashboard";
    const files = readRecursive(sourceDir);

    // Go through all endpoints and parse the objects
    app.get("/api/dashboard/test", createEndpointHandler({
        authentication: "loggedIn",
        action: (userData, trustedData) => {
            console.log("IN ENDPOINT");
            console.log(userData, trustedData);
            console.log("END ENDPOINT");
            return { "coolValue": new Date().getTime() };
        }
    }, { mustReturn: true }));

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
