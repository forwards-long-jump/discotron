window.Discotron.RepositoryListController = class extends window.Discotron.Controller {
	/**
	 * Ctor 
	 */
	constructor() {
		super("owner/repository-list.html", () => {
			this._addEventListeners();
		});
	}

	_addEventListeners() {
		document.getElementById("add-repository").onclick = this._onAddRepository;
		document.getElementById("repository-url").onkeyup = (e) => {
			if (e.keyCode === 13) {
				document.getElementById("add-repository").onclick();
			}
		};
	}

	/**
	 * Display the list of repositories and the plugins 
	 */
	_displayRepos() {

	}

	/**
	 * Add a plugin card
	 * @param {Plugin} plugin Plugin
	 */
	_displayPluginCard(plugin) {

	}

	/**
	 * Show the plugin settings widget for the selected plugin
	 */
	_onPluginClick() {

	}

	/**
	 * Called when add repository button is presse
	 */
	_onAddRepository(event) {
		let repoUrl = document.getElementById("repository-url").value;
		if (repoUrl !== "") {
			document.getElementById("add-repository").disabled = true;
			Discotron.WebAPI.queryBot("discotron-dashboard", "add-repository", {
				url: repoUrl
			}).then((data) => {
				document.getElementById("add-repository").disabled = false;
				if (!data) {
					document.getElementById("repository-error").textContent = "Could not load repository";
					document.getElementById("repository-url").focus();
					document.getElementById("repository-url").select();
				} else {
					document.getElementById("repository-url").value = "";
					document.getElementById("repository-url").focus();
					// TODO: Refresh
				}
			});
		}
	}

	/**
	 * Called when a repository is deleted
	 */
	_onRemoveRepository(arg) {

	}

	/**
	 * Called when the update button is pressed
	 */
	_onUpdateRepository() {

	}

	/**
	 * Called when repo refresh button is pressed
	 */
	_onRepositoryStatusRefresh() {

	}
};