class Router {
    /**
     * 
     * @param {*} controllers 
     */
    constructor(controllers) {
        this.controllers = controllers; // associative table name => controller
        this._botStatusController = new window.Discotron.BotStatusController();
    }

    onLinkClick() {

    }

    onURLChange() {
        
    }

    loadPage() {

    }

    registerEventsListener() {
    }
    
    parseURL(url) {
        
    }
}