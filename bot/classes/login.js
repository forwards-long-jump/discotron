class Login {
    /**
     * Ctor
     */
    constructor() {
        this._users = {};
        this._noOwnersRegistered = true;
        this._initialOwnershipSecret = undefined; // Undefined after ownership is claimed

        this._handleFirstLaunch();
    }

    /**
     * Method called by the API to log in a user
     * @param {string} authToken 
     * @returns Promise
     */
    login(authToken) {
        return new Promise((resolve, reject) => {
            this._getAccessToken(authToken).then(() => {
                // success
                resolve();
            }).catch(() => {
                // fail
                reject();
            });
        });
    }

    /**
     * Returns the client ID associated with the app token
     * @param {string} appToken 
     * @returns Promise
     */
    getClientId(appToken) {
        // return this._users[appToken] ...
    }

    /**
     * Queries the discord API to get the access token
     * @param {string} authToken 
     * @returns Promise
     */
    _getAccessToken(authToken) {

    }

    /**
     * Gets the user's client ID via the discord API
     * @param {*} accessToken 
     * @returns Promise
     */
    _queryClientId(accessToken) {

    }

    /**
     * Generates a key for the user
     * @returns string
     */
    _createAppToken() {

    }

    /**
     * Generates a key for the user
     * @returns string
     */
    _handleFirstLaunch() {
        // if Owner.hasAnyOwner()...
        //         this._noOwnersRegistered = true;
    }

    /**
     * Add a user to the database
     * @param {string} discordId 
     * @param {string} accessToken 
     * @param {string} appToken 
     * @param {string} refreshToken 
     * @param {number} expireDate 
     */
    _addUser(discordId, appToken, accessToken, refreshToken, expireDate) {

    }

    /**
     * On first login, make the user the owner of the bot. note: he must authenticate using the secret
     * @param {string} secret 
     * @param {string} authToken 
     */
    claimOwnerShip(secret, authToken) {
        if (secret === this._initialOwnershipSecret) {

        }
    }
}