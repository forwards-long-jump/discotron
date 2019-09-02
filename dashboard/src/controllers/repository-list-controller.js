window.Discotron.RepositoryListController = class extends window.Discotron.Controller {
	/**
	 * Ctor 
	 */
	constructor() {
		super("owner/repository-list.html", () => {
			this._addEventListeners();
			this._displayRepos();
		});
	}

	_addEventListeners() {
		document.getElementById("add-repository").onclick = () => {
			this._onAddRepository();
		};

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
		Discotron.Repository.getAll().then((repositories) => {
			if (repositories.length > 0) {
				document.getElementById("repositories-container").innerHTML = "";
			}

			for (let i = 0; i < repositories.length; i++) {
				const repo = repositories[i];
				let template = document.getElementById("template-repository-container");
				let container = document.importNode(template.content, true);

				container.querySelector(".plugin-bar").value = repo.url;
				document.getElementById("repositories-container").appendChild(container);
			}
		});
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
	_onAddRepository() {
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
					Discotron.Repository.clearCache();

					this._displayRepos();
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