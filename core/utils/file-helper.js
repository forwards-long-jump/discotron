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

// Source: https://gist.github.com/VinGarcia/ba278b9460500dad1f50
/**
 * Recursively returns all files contained in the specified directory.
 * @param {string} path Path to directory.
 * @param {Array<string>} fileList Currently discovered files list.
 * @returns {Array<string>} List of files in directory tree.
 */
let readRecursive = function (path, fileList) {

    if (path[path.length - 1] !== "/") {
        path = path.concat("/");
    }

    const files = fs.readdirSync(path);
    fileList = fileList || [];
    files.forEach(function (file) {
        if (fs.statSync(path + file).isDirectory()) {
            fileList = readRecursive(path + file + "/", fileList);
        } else {
            fileList.push(path + file);
        }
    });
    return fileList;
};

module.exports.readRecursive = function (path) {
    return readRecursive(path, []);
};
