window.Discotron.utils = {
    post: (url, data) => {
        // source: http://youmightnotneedjquery.com/
        let request = new XMLHttpRequest();
        request.open("POST", url, true);
        request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        request.send(JSON.stringify(data));
    },
    load: (url, targetElement, callback) => {
        // source: https://stackoverflow.com/questions/38132510/equivalent-to-load-without-jquery
        fetch(url)
            .then(function (response) {
                return response.text();
            })
            .then(function (body) {
                targetElement.innerHTML = body;
                if(typeof callback === "function") {
                    callback();
                }
            });
    }
};