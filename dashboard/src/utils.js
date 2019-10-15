window.Discotron.utils = {
    /**
     * Make a post request on the specified URL, with data encoded as json
     * @param {string} url Url to make the post request on
     * @param {object} data Data that will be JSON.stringify'd and sent to the website
     * @returns {Promise} resolve(data)
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
                    } catch (e) {
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
            });
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
        ctx.fillText(acronym, size/2, size/2);

        // Render to data url
        const img = canvas.toDataURL('image/png');
        return img;
    }
};