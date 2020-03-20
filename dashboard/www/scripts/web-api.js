class WebApi {
    constructor() {
        // location.pathname is something like: /dashboard/#repository-list
        this._currentScope = window.location.pathname.split("/")[1];
        this._cache = {};
    }

    /**
     * Send a GET request to the API.
     * @param {string} endpoint Endpoint to request, in absolute or relative form.
     * @param {object} data User data to add to the request.
     * @returns {Promise<object>} Result object containing the data, or a WebApiError is thrown.
     */
    get(endpoint, data = {}) {
        return this._query("GET", endpoint, data);
    }

    /**
     * Send a POST request to the API.
     * @param {string} endpoint Endpoint to request, in absolute or relative form.
     * @param {object} data User data to add to the request.
     * @returns {Promise<object>} Result object containing the data, or a WebApiError is thrown.
     */
    post(endpoint, data = {}) {
        return this._query("POST", endpoint, data);
    }

    /**
     * Send a PUT request to the API.
     * @param {string} endpoint Endpoint to request, in absolute or relative form.
     * @param {object} data User data to add to the request.
     * @returns {Promise<object>} Result object containing the data, or a WebApiError is thrown.
     */
    put(endpoint, data = {}) {
        return this._query("PUT", endpoint, data);
    }

    /**
     * Send a DELETE request to the API.
     * @param {string} endpoint Endpoint to request, in absolute or relative form.
     * @param {object} data User data to add to the request.
     * @returns {Promise<object>} Result object containing the data, or a WebApiError is thrown.
     */
    delete(endpoint, data = {}) {
        return this._query("DELETE", endpoint, data);
    }

    /**
     * Send a query to the bot via the API.
     * If possible, use the specific methods of the api instead of this one.
     * @param {string} verb HTTP verb for the query.
     * @param {string} endpoint Endpoint to request, in absolute or relative form.
     * @param {object} data User data to add to the request.
     * @returns {Promise<object>} Result object containing the data, or a WebApiError is thrown.
     */
    async _query(verb, endpoint, data) {
        const url = this._parseEndpoint(endpoint);

        // Do a cache lookup if possible
        if (verb === "GET") {
            const cachedValue = this._lookupCache(url, data);
            if (cachedValue !== null) {
                return cachedValue; 
            }
        }

        // Create the query's body
        const body = {
            data: data,
            appToken: localStorage.appToken
        };

        // Send request to API
        const response = await discotron.utils.query(verb, `/api${url}`, body);
        if (response.error) {
            if (response.source === "core") {
                switch (response.error.codeName) {
                    case "authentication-invalid-app-token":
                        // Logout
                        for (const key of ["username", "discordUserId", "discriminator", "avatar", "appToken"]) {
                            localStorage.removeItem(key);
                        }
                        window.location.replace("/");
                        break;
                    // TODO: do we have to handle any other core errors in a special way?
                }
            }

            // An error caused by the endpoint can be caught by the caller
            // But otherwise, it will be handled by window.onerror globally
            throw discotron.WebApiError.deserialize(response.error);
        } else {
            // Server's response
            if (verb === "GET" && response.timeToLive) {
                // Add to cache
                this._addToCache(`${url}`, body.data, response);
            }
            return response.data;
        }
    }

    /**
     * Adds a query's result to the cache.
     * @param {string} endpoint Endpoint URL to cache.
     * @param {object} requestData Data object of the request.
     * @param {object} response Response object from the server.
     */
    _addToCache(endpoint, requestData, response) {
        // Add missing endpoint key
        if (!Object.prototype.hasOwnProperty.call(this._cache, endpoint)) {
            this._cache[endpoint] = [];
        }

        // Construct cache value
        const cacheValue = {
            parameters: requestData,
            data: response.data,
            validUntil: new Date().getTime() + response.timeToLive * 60000 /* 60000 to convert minutes to milliseconds */
        };

        // Add to cache
        // TODO: In theory we should do a cache lookup first to check if this parameter combination already exists.
        //       Although it can't with the location we're currently calling _addToCache, this might change and cause the cache to fill up rapidly?
        this._cache[endpoint].push(cacheValue);
    }

    /**
     * Does a lookup in the cache, comparing the *requestData* with the cache's *parameters*.
     * @param {string} endpoint Endpoint URL to cache.
     * @param {object} requestData Data object of the request.
     * @returns {object} The `cacheValue` if it exists (includes *validUntil*, *data* and *parameters*), otherwise `null`.
     * If the to-be-returned `cacheValue` expired, it is deleted from the cache and `null` is returned.
     */
    _lookupCache(endpoint, requestData) {
        const cacheArray = this._cache[endpoint];
        if (cacheArray === undefined || cacheArray.length === 0) {
            return null;
        }

        for (let i = 0; i < cacheArray.length; i++) {
            const cacheValue = cacheArray[i];

            // Find same parameters combination
            if (discotron.utils.objectEquals(cacheValue.parameters, requestData)) {
                // Purge if needed
                if (new Date().getTime() >= cacheValue.validUntil) {
                    cacheArray.splice(i, 1);
                    return null;
                }
                return cacheValue;
            }
        }

        return null;
    }

    /**
     * Parses the given endpoint's URL from relative to absolute form,
     * verifying its format for integrity (but not whether it exists!).
     * @param {string} endpoint The endpoint URL.
     * @returns {string} Absolute form of the endpoint URL.
     */
    _parseEndpoint(endpoint) {
        if (!endpoint) {
            throw new Error("No endpoint to parse.");
        }

        if (endpoint.startsWith("/")) {
            // We should verify that the endpoint URL is formatted like: /[plugin]/endpoint
            // since we require something to follow the plugin id
            const index = endpoint.indexOf("/", 1);
            if (index < 0) {
                throw new Error("Invalid API call to \"" + endpoint + "\" does not include an endpoint.");
            }

            return endpoint;
        } else {
            // Use currentScope
            return `/${this._currentScope}/${endpoint}`;
        }
    }

    /**
     * Clears the specified cache(s).
     * @param {string} endpoint Endpoint glob. Use * for recursively wildcard-selecting endpoints.
     * For example, `guild/*` will target the endpoint `guild` and any files found recursively in the `guild/` folder.
     * @param {boolean} [clean] If true, only remove dead cache values. Otherwise, get rid of all cache values instead.
     */
    clearCache(endpoint, clean = false) {
        // TODO: We should probably run the cache clean function every now and again,
        //       to ensure our cache doesn't just grow over time if we keep getting cache misses
        const url = this._parseEndpoint(endpoint);
        const targets = [];
        if (url.endsWith("/*")) {
            // Handle endpoint globbing
            const glob = url.slice(0, -2); /* 2 is length of "/*" */
            for (const key in this._cache) {
                if (key.startsWith(glob)) {
                    targets.push(key);
                }
            }
        } else {
            // Specific endpoint to target
            targets.push(endpoint);
        }

        const now = new Date().getTime();
        for (const target of targets) {
            // Verify it exists first
            const cacheArray = this._cache[target];
            if (cacheArray === undefined) {
                continue;
            }

            // Do some action
            if (clean) {
                // Remove based on ttl
                // Source: https://stackoverflow.com/a/9882349/7475278
                let i = cacheArray.length;
                while (i--) {
                    const cacheValue = cacheArray[i];
                    if (now >= cacheValue.validUntil) {
                        cacheArray.splice(i, 1);
                    }
                }
            } else {
                // Just remove all values
                this._cache[target] = [];
            }
        }
    }
}

window.discotron.WebApi = new WebApi();
