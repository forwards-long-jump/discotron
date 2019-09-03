window.Discotron.BotStatusController = class extends window.Discotron.Controller {
	/**
	 * Ctor
	 */
	constructor() {
		super("owner/bot-status.html", () => {
			this._displayStatus();
			this._addEvents();
		});
	}

	/**
	 * Display current status of the bot
	 */
	_displayStatus() {
		// TODO: Use WebAPI auto caching
		if (Discotron.BotStatusController._username === undefined) {
			Discotron.WebAPI.queryBot("discotron-dashboard", "get-bot-info").then((data) => {
				document.querySelector("#bot-avatar").src = data.avatar;
				document.querySelector("#bot-name").textContent = data.username;

				Discotron.BotStatusController._username = data.username;
				Discotron.BotStatusController._avatar = data.avatar;
			});
		} else {
			document.querySelector("#bot-avatar").src = Discotron.BotStatusController._avatar;
			document.querySelector("#bot-name").textContent = Discotron.BotStatusController._username;
		}

		Discotron.WebAPI.queryBot("discotron-dashboard", "get-bot-config").then((data) => {

			let status, classStatus;
			if (data.status === 0) {
				status = "Online";
				classStatus = "green-text";
			} else {
				status = "Offline (Status: " + data.status + ")";
				classStatus = "red-text";
			}

			document.getElementById("bot-name").innerHTML += "<span class=\"bot-status " + classStatus + "\">" + status + "</span>";
			document.getElementById("bot-status").value = data.botStatus;
			document.getElementById("maintenance-enabled").checked = data.maintenance;
		});
	}

	/**
	 * Called when the user clicks on the owners pseudo link
	 */
	_onOwnersClick() {
		// Open a widget
	}

	/**
	 * Reloads the data on the page
	 */
	_onReloadClick() {

	}

	/**
	 * Called when the user toggles the maintenance settings
	 */
	_onMaintenanceToggle() {

	}

	/**
	 * Called when the help text input is changed
	 */
	_onHelpTextChange() {

	}

	/**
	 * Called when the user saves the widget
	 */
	_onOwnersWidgetSave() {

	}

	/**
	 * Add events
	 */
	_addEvents() {
		let saveSettingsButton = document.getElementById("save-settings");
		let restartButton = document.getElementById("restart-bot");
		document.getElementById("bot-status").onkeyup = () => {
			saveSettingsButton.disabled = false;
		};

		document.getElementById("maintenance-enabled").onchange = () => {
			saveSettingsButton.disabled = false;
		};

		saveSettingsButton.onclick = () => {
			saveSettingsButton.disabled = true;

			Discotron.WebAPI.queryBot("discotron-dashboard", "set-bot-config", {
				statusText: document.getElementById("bot-status").value,
				maintenance: document.getElementById("maintenance-enabled").checked
			}).then((data) => {

			});
		};

		restartButton.onclick = () => {
			restartButton.disabled = true;
			restartButton.value = "Restarting...";
			Discotron.WebAPI.queryBot("discotron-dashboard", "restart-bot").then((data) => {
				if (data === true) {
					restartButton.value = "Restart";
					restartButton.disabled = false;
				}
			});
		};

		document.getElementById("owners-selector").onclick = () => {
			Discotron.WebAPI.queryBot("discotron-dashboard", "get-owner-ids").then((owners) => {
				let userRoles = owners.map((owner) => {
					return new Discotron.UserRole(owner, "user");
				});
				new Discotron.UserRoleWidgetController(undefined, userRoles, (newOwners) => {
					Discotron.WebAPI.queryBot("discotron-dashboard", "set-owners", {
						discordUsersIds: newOwners.map((userRole) => {
							return userRole.discordId;
						})
					}).then(() => {});
				}, false, "Owner list", false, () => {});
			});
		};
	}
};

Discotron.BotStatusController._avatar = undefined;
Discotron.BotStatusController._username = undefined;