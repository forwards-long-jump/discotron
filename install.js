const fs = require("fs");
const readlineSync = require("readline-sync");

const instancePath = "./instance";
const port = 47131;

// Create the directory if it does not exist
if (!fs.existsSync(instancePath)) {
    fs.mkdirSync(instancePath);
}

const footprint = instancePath + "/.installed";
if (fs.existsSync(footprint)) {
    console.log("Discotron Install Script already ran, skipping.");
    process.exit(0);
}

// Check if some files are already existing
const appConfig = instancePath + "/bot.json";
if (fs.existsSync(appConfig)) {
    console.log("File", appConfig, "already exists, but installation was not run yet!");
    console.log("Please delete the file to re-run the installation.");
    process.exit(1);
}

const dashboardConfig = instancePath + "/dashboard.js";
if (fs.existsSync(dashboardConfig)) {
    console.log("File", dashboardConfig, "already exists, but installation was not run yet!");
    console.log("Please delete the file to re-run the installation.");
    process.exit(1);
}

console.log("=== Discotron Install Script ===");
console.log("This script will create a default configuration in the 'instance' folder to get the bot up and running.");
console.log("Check the readme file inside for how Discotron handles its configuration files.");
console.log("If you haven't already, visit https://discordapp.com/developers/applications/ and create a new application for Discotron.");
console.log("The following information is retrieved from the application's page and settings. (The tab name and text box label is specified for each prompt.)\n");

let appId;
do {
    if (appId !== undefined) {
        console.log("Invalid value! Must be numeric.");
    }

    appId = readlineSync.question("(General Information tab) Enter the application's CLIENT ID: ");
} while (appId.match(/^[0-9]+$/) === null);


let appSecret;
do {
    if (appSecret !== undefined) {
        console.log("Invalid value! Must be 32 bytes long.");
    }
    appSecret = readlineSync.question("(General Information tab) Enter the CLIENT SECRET: ");

    // 32 bytes long
} while (appSecret.length !== 32);

let domain = readlineSync.question("IP address or domain name to access the dashboard from (if not set, localhost is used): ");

if (domain.length === 0) {
    // fallback value: localhost
    domain = "http://localhost";
}

// Remove port and slash suffix
// Although it can be configured, we do not care about this for first time setup!
domain = domain.replace(/(:\d+)?\/$/, "");
domain += `:${port}/dashboard/login.html`;

let redirectURL;
do {
    if (redirectURL !== undefined) {

        console.log("Invalid value! Must be a domain name (http(s)://) or an IP address.");
    }
    // TODO: We could auto-generate this url, but user still has to be prompted to specify on the app's page!
    console.log("(OAuth2 tab) On the tab, for the Redirection URL, enter", domain);
    redirectURL = readlineSync.question("             Select scopes 'identify' and 'guilds' and copy the generated URL: ");

    // just check if we specified anything
} while (redirectURL.length === 0);

let token;
do {
    if (token !== undefined) {
        console.log("Invalid value! Must be 59 bytes long.");
    }

    token = readlineSync.question("(Bot tab) Create a bot (if you haven't already) and enter its TOKEN: ");

    // 59 bytes long
} while (token.length !== 59);

let privateKey;
let certificate = "";
if (redirectURL.startsWith("https")) {
    do {
        if (privateKey !== undefined) {
            console.log("Could not find given file. Please leave empty or make sure it exists.");
        }
        privateKey = readlineSync.question("OPTIONAL: Path to a private key file for https: ");

        // Force the pkey to either be valid or empty
    } while (privateKey.length !== 0 && !fs.existsSync(privateKey));

    if (privateKey.length !== 0) {
        do {
            if (certificate.length !== 0) {
                console.log("Could not find given file.");
            }
            certificate = readlineSync.question("Path to a certificate file for https: ");
        } while (certificate.length !== 0 && !fs.existsSync(certificate));

        if (certificate.length === 0) {
            // Although certificate is not labelled to be optional, if we accidentially enter this state,
            // we wouldn't be able to leave it unless we entered something or cancel. This allows us to bail.
            privateKey = "";
        }
    }
}

// Create and populate application config file
console.log("Creating required files...");

let data = JSON.stringify({
    token: token,
    applicationId: appId,
    oauth2Secret: appSecret,
    redirectURI: domain,
    privateKey: privateKey,
    certificate: certificate
}, null, 4);

fs.writeFileSync(appConfig, data, function (err) {
    if (err) {
        console.log("Error writing bot.json: ", err);
    }
});

data = `window.discotron.config = {
    inviteLink: "https://discordapp.com/oauth2/authorize?client_id=${appId}&scope=bot&permissions=0",
    oauthURL: "${redirectURL}"
};`;

fs.writeFile(dashboardConfig, data, function (err) {
    if (err) {
        console.log("Error writing dashboard.js: ", err);
    }
});

fs.writeFile(footprint, "", function (err) {
    if (err) {
        console.log("Error writing .installed: ", err);
    }
});

console.log("Finished installation!");
