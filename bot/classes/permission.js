class Permission extends PermissionModel {
    constructor(userRoles, pluginDevname) {
        super(userRoles, pluginDevname);
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