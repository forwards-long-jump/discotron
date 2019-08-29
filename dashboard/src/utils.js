window.Discotron.utils = {
    post: (url, data) => {
        // source: http://youmightnotneedjquery.com/
        var request = new XMLHttpRequest();
        request.open("POST", url, true);
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
        request.send(data);
    },
    load: (url, targetElement) => {
        // source: https://stackoverflow.com/questions/38132510/equivalent-to-load-without-jquery
        fetch(url)
            .then(function (response) {
                return response.text();
            })
            .then(function (body) {
                targetElement.innerHTML = body;
            });
    }
};