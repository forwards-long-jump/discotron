const fs = require("fs");

/**
 * Delete recursively a folder, including the folder itself
 * @param {string} path Absolute path to delete (be careful with relative paths, nobody knows how it works)
 */
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