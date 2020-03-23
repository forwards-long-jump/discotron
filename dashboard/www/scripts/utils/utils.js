window.discotron.utils = class {
    /**
     * Make a HTTP request on the specified URL, with data encoded as json
     * @param {string} verb HTTP verb to send request with
     * @param {string} url Url to make the post request on
     * @param {object} [body] Data that will be JSON.stringified and sent to the website. Will be converted as URL params for GET requests, which will convert everything to string.
     * @param {object} [appToken] Application token that will be sent in the Authorization header
     * @returns {Promise} resolve(data {object|string}) data: object if could parse JSON, reject()
     */
    static async query(verb, url, body, appToken) {
        const headers = { "Content-Type": "application/json" };

        if (appToken !== undefined) {
            headers["Authorization"] = `Bearer ${appToken}`;
        }

        const request = {
            method: verb,
            headers: headers,
            mode: "cors",
            cache: "no-cache",
            credentials: "same-origin",
            redirect: "follow",
            referrerPolicy: "no-referrer",
        };

        // Get cannot have a body, but we want to easily be able to use an object in the parameters
        if (verb === "GET") {
            url += "?" + new URLSearchParams(body).toString();
            body = undefined; // Unset the body as get cannot have one
        }

        if (body !== undefined) {
            request.body = JSON.stringify(body);
        }

        const response = await fetch(url, request);
        return await response.json();
    }
    static load(url, targetElement, callback) {
        // source: https://stackoverflow.com/questions/38132510/equivalent-to-load-without-jquery
        fetch(url)
            .then(function (response) {
                return response.text();
            })
            .then(function (body) {
                targetElement.innerHTML = body;
                if (typeof callback === "function") {
                    callback();
                }
            }).catch(console.error);
    }
    static generateAcronymIcon(acronym, fgColor, bgColor) {
        const size = 88;
        const padding = 4;
        const font = "sans-serif";

        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;

        // Fill canvas background
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, size, size);

        // Add text, fit to size
        let fontsize = 30;
        do {
            ctx.font = `${fontsize}px ${font}`;
            fontsize--;
        } while (ctx.measureText(acronym).width > size - padding);

        ctx.fillStyle = fgColor;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(acronym, size / 2, size / 2);

        // Render to data url
        return canvas.toDataURL("image/png");
    }
    /**
     * Source: https://stackoverflow.com/questions/4482686/check-synchronously-if-file-directory-exists-in-node-js
     * @param {object} object object
     * @returns {boolean} True if the object is empty
     */
    static isEmpty(object) {
        return Object.entries(object).length === 0 && object.constructor === Object;
    }
    /**
     * Check if object is empty, if it is calls loadFunction before resolving
     * @param {object|Array} object object or array
     * @param {Function} loadFunction function that will fill object if empty (), must return a promise after changing object
     * @returns {Promise} resolve(object {object}) object:
     */
    static getOrLoad(object, loadFunction) {
        const loaded = Array.isArray(object) ? object.length !== 0 : !window.discotron.utils.isEmpty(object);

        return new Promise((resolve, reject) => {
            if (loaded) {
                resolve(object);
            } else {
                loadFunction(object).then(() => {
                    resolve(object);
                }).catch(reject);
            }
        });
    }
    /**
     * Compare the equality of two objects, by eqeqeq-comparing each property's value.
     * @param {object} obj1 Left object.
     * @param {object} obj2 Right object.
     * @returns {boolean} True if they are equal.
     */
    static objectEquals(obj1, obj2) {
        const props1 = Object.getOwnPropertyNames(obj1);
        const props2 = Object.getOwnPropertyNames(obj2);

        // Different number of properties
        if (props1.length !== props2.length) {
            return false;
        }

        // Value-compare each property's value
        for (let i = 0; i < props1.length; i++) {
            const prop = props1[i];
            if (obj1[prop] !== obj2[prop]) {
                return false;
            }
        }

        return true;
    }
};
