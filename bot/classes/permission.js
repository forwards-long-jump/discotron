class Permission {
    constructor(userIds, roleIds, defaultPermission) {
        this._userIds = userIds;
        this._roleIds = roleIds;

        this._defaultPermission = defaultPermission; // Permission to use if no roles / users have been set
    }

    allows(user) {
        // TODO: correct this
        /*if (this._userIds.contains(user.id)) return true;
        for (let i = 0; i < this._roleIds.length; ++i) {
            if (user.hasRole(this._roleIds[i])) return true;
        }
        return false;*/
    }
}

module.exports = Permission;