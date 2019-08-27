class PermissionModel{
    constructor(usersRoles, plugin) {
        this._usersRoles = usersRoles;
        this._plugin = plugin; // necessary to check defaultPermission
    }
}