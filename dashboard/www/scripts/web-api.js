class WebApi {
    constructor() {
        // location.pathname is something like: /dashboard/#repository-list
        this._currentScope = window.location.pathname.split("/")[1];
    }

    get(endpoint, data) {
        this.query("GET", endpoint, data);
    }

    post(endpoint, data) {
        this.query("POST", endpoint, data);
    }

    put(endpoint, data) {
        this.query("PUT", endpoint, data);
    }

    delete(endpoint, data) {
        this.query("DELETE", endpoint, data);
    }

    /**
     * Send a query to the bot via the API
     * @static
     * @param {string} verb HTTP verb for the query
     * @param {string} endpoint Relative or absolute endpoint to the API
     * @param {object} data Data that will JSON.stringified and sent to the bot
     * @returns {Promise} resolve(data {object}) data: result given by the API, reject()
     */
    query(verb, endpoint, data) {
        let scope;
        if (endpoint.startsWith("/")) {
            // Retrieve scope from endpoint: /[plugin]/endpoint
            const index = endpoint.indexOf("/", 1);
            if (index < 0) {
                throw new Error("Invalid API call to \"" + endpoint + "\" does not include an endpoint.");
            }

            scope = endpoint.slice(1, index);
            endpoint = endpoint.slice(index + 1);
        } else {
            // Use currentScope
            scope = this._currentScope;
        }

        // Create the query's body
        const body = {
            data: data,
            appToken: localStorage.appToken
        };

        // Send request to API
        return new Promise((resolve, reject) => {
            discotron.utils.query(verb, `/api/${scope}/${endpoint}`, body).then((response) => {
                if (response.error) {
                    if (response.source === "core") {
                        switch (response.error.codeName) {
                            case "authentication-invalid-app-token":
                                // TODO: Logout
                                return;
                        }
                    }
                    
                    // An error caused by the endpoint can be caught by the caller
                    // But otherwise, it will be handled by window.onerror globally
                    reject(discotron.WebApiError.deserialize(response.error));
                } else {
                    // Server's response
                    resolve(response.data);
                }
            });
        });
    }
}

window.discotron.WebApi = new WebApi();
