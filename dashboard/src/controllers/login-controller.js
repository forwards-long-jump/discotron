window.Discotron.LoginController = class  /* does not extends Controller because it is not a logged in page*/ {
    /**
     * Call API to get an app token, saves the app token in localStorage
     * @param {string} authToken Discord given authentification token
     */
    static login(authToken) {
        // Cannot login if no owners, claimOwnership is used instead
    }

    /**
     * Replaces standard login as long as the bot has no owner
     * Logins, and sets the current user as owner
     * @param {string} authToken Discord given authentification token
     * @param {string} secret Secret given to the user in the console     
     * */
    static claimOwnership(authToken, secret) {
        
    }

    /**
     * Display secret input if no owners
     */
    static handleOwnershipClaim() {
        
    }

    /**
     * Add events to buttons
     */
    static addEvents() {
        
    }
};