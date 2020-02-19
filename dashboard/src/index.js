// App token not set => we have to log in
if (localStorage.getItem("appToken") === null) {
    document.location.replace("/login");
} else {
    discotron.Router.addEvents();
    discotron.Router.route(document.location.href);

    discotron.NavigationController.displayOwnerSettings();
    discotron.NavigationController.displayBot();
    discotron.NavigationController.addEvents();
    discotron.NavigationController.displayServers();
    discotron.NavigationController.displayUser();
}