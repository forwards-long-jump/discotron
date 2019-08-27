class PermissionModel{
    constructor(usersRoles, plugin) {
        this._usersRoles = usersRoles;
        this._plugin = plugin; // necessary to check defaultPermission
    }

    allows(userId) {
        // TODO :
        // if (userroles is not empty)
        //  for userRole in usersroles
        //   if (userRole.describes(userId)) return true;
        //  return false
        // else do according to defaultpermission
    }
}