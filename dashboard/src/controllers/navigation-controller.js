window.Discotron.NavigationController = class {
	/**
	 * Display links in the "owner" section
	 */
	static displayOwnerSettings() {
		return new Promise();
	}

	/**
	 * Display links in the "admin" section
	 */
	static displayServers() {
		return new Promise();
	}

	/**
	 * Load bot status and display it on top
	 */
	static displayBot() {
		console.log("lel");
		
		Discotron.WebAPI.queryBot("discotron-dashboard", "get-bot-info").then((data) => {
			console.log("Queri");
			
			document.querySelector("#bot-info img").src = data.avatar;
			document.querySelector("#bot-info span").textContent = data.username;
		});
	}

	/**
	 * Load user status and display it on top
	 */
	static displayUser() {
		document.querySelector("#user-info img").src = `https://cdn.discordapp.com/avatars/${localStorage.getItem("clientId")}/${localStorage.getItem("avatar")}.png`;
		document.querySelector("#user-info span").textContent = `${localStorage.getItem("username")}#${localStorage.getItem("discriminator")}`;
	}
};