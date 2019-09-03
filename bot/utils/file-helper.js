const fs = require("fs");

let deleteRecursive = function (path) {
    if (path === "/" || typeof path !== "string") {
        return;
    }

    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach((file) => {
            let currentPath = path + "/" + file;

            if (fs.lstatSync(currentPath).isDirectory()) {
                deleteRecursive(currentPath);
            } else {
                fs.unlinkSync(currentPath);
            }
        });

        fs.rmdirSync(path);
    }
};

module.exports.deleteFolder = deleteRecursive;