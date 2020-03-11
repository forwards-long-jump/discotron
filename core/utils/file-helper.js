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
 * @param {string} dir Path to directory.
 * @param {Array<string>} filelist Currently discovered files list.
 * @returns {Array<string>} List of files in directory tree.
 */
let readRecursive = function (dir, filelist) {

    if (dir[dir.length - 1] !== "/") {
        dir = dir.concat("/");
    }

    const files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function (file) {
        if (fs.statSync(dir + file).isDirectory()) {
            filelist = readRecursive(dir + file + "/", filelist);
        } else {
            filelist.push(dir + file);
        }
    });
    return filelist;
};

module.exports.readRecursive = function (path) {
    return readRecursive(path, []);
};
