const fs = require("fs");

/**
 * Delete recursively a folder, including the folder itself
 * @param {string} path Absolute path to delete (be careful with relative paths, nobody knows how it works)
 */
module.exports.deleteFolder = function (path) {
    if (path === "/" || typeof path !== "string") {
        return;
    }

    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach((file) => {
            const currentPath = path + "/" + file;

            if (fs.lstatSync(currentPath).isDirectory()) {
                this.deleteFolder(currentPath);
            } else {
                fs.unlinkSync(currentPath);
            }
        });

        fs.rmdirSync(path);
    }
};

// Source: https://gist.github.com/VinGarcia/ba278b9460500dad1f50
/**
 * Recursively returns all files contained in the specified directory.
 * @param {string} path Path to directory.
 * @param {Array<string>} fileList Currently discovered files list.
 * @returns {Array<string>} List of files in directory tree.
 */
module.exports.readRecursive = function (path, fileList = []) {
    if (path[path.length - 1] !== "/") {
        path = path.concat("/");
    }

    const files = fs.readdirSync(path);
    fileList = fileList || [];
    files.forEach(function (file) {
        if (fs.statSync(path + file).isDirectory()) {
            fileList = this.readRecursive(path + file + "/", fileList);
        } else {
            fileList.push(path + file);
        }
    });
    return fileList;
};
