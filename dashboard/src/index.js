// App token not set => we have to log in
if (localStorage.getItem("appToken") === null) {
    document.location.replace("/login");
} else {
    Discotron.Router.addEvents();
    Discotron.Router.route(document.location.href);

    Discotron.NavigationController.displayUser();
}