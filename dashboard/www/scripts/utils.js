window.discotron.utils = {
    /**
     * Make a post request on the specified URL, with data encoded as json
     * @param {string} url Url to make the post request on
     * @param {object} data Data that will be JSON.stringified and sent to the website
     * @returns {Promise} resolve(data {object|string}) data: object if could parse JSON, reject()
     */
    post: (url, data) => {
        return new Promise((resolve, reject) => {
            // source: http://youmightnotneedjquery.com/
            let request = new XMLHttpRequest();
            request.open("POST", url, true);
            request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            request.send(JSON.stringify(data));

            request.onreadystatechange = () => {
                if (request.readyState === XMLHttpRequest.DONE) {
                    try {
                        resolve(JSON.parse(request.responseText));
                    } catch (err) {
                        resolve(request.responseText);
                    }
                }
            };
        });
    },
    load: (url, targetElement, callback) => {
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
    },
    generateAcronymIcon: (acronym, fgColor, bgColor) => {
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
    },
    /**
     * Source: https://stackoverflow.com/questions/4482686/check-synchronously-if-file-directory-exists-in-node-js
     * @param {object} object object
     * @returns {boolean} True if the object is empty
     */
    isEmpty: (object) => {
        return Object.entries(object).length === 0 && object.constructor === Object;
    },
    /**
     * Check if object is empty, if it is calls loadFunction before resolving
     * @param {object|Array} object object or array
     * @param {Function} loadFunction function that will fill object if empty (), must return a promise after changing object
     * @returns {Promise} resolve(object {object}) object:
     */
    getOrLoad: (object, loadFunction) => {
        let loaded = Array.isArray(object) ? object.length !== 0 : !window.discotron.utils.isEmpty(object);

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
};