const fs = require("fs");
const readlineSync = require("readline-sync");

const instancePath = "../instance";
const port = 47131;

//Create the directory if it does not exist
if (!fs.existsSync(instancePath)) {
    fs.mkdirSync(instancePath);
}

const footprint = instancePath + "/.installed";
if (fs.existsSync(footprint)) {
    console.log("Discotron Install Script already ran, skipping.");
    process.exit(0);
}

//Check if some files are already existing
const appcfg = instancePath + "/bot.json";
if (fs.existsSync(appcfg)) {
    console.log("File", appcfg, "already exists, but installation was not run yet!");
    console.log("Please delete the file to re-run the installation.");
    process.exit(1);
}

const dashcfg = instancePath + "/dashboard.js";
if (fs.existsSync(dashcfg)) {
    console.log("File", dashcfg, "already exists, but installation was not run yet!");
    console.log("Please delete the file to re-run the installation.");
    process.exit(1);
}

console.log("=== Discotron Install Script ===");
console.log("This script will create a default configuration in the 'instance' folder to get the bot up and running.");
console.log("Check the readme file inside for how Discotron handles its configuration files.");
console.log("If you haven't already, visit https://discordapp.com/developers/applications/ and create a new application for Discotron.");
console.log("The following information is retrieved from the application's page and settings. (The tab name and text box label is specified for each prompt.)\n");

let appId;
while (true) {
    appId = readlineSync.question("(General Information tab) Enter the application's CLIENT ID: ");
    if (appId.match(/^[0-9]+$/) !== null) {
        break;
    }
    console.log("Invalid value! Must be numeric.");
}

let appSecret;
while (true) {
    appSecret = readlineSync.question("(General Information tab) Enter the CLIENT SECRET: ");
    // 32 bytes long
    if (appSecret.length === 32) {
        break;
    }
    console.log("Invalid value! Must be 32 bytes long.");
}

let domain = readlineSync.question("IP address or domain name to access the dashboard from (if not set, localhost is used): ");

if (domain.length === 0) {
    // fallback value: localhost
    domain = "http://localhost";
}

// Remove port and slash suffix
// Although it can be configured, we do not care about this for first time setup!
domain = domain.replace(/(:\d+)?\//, "");
domain += `:${port}/dashboard/login.html`;

var redirurl;
while (true) {
    // todo we could auto-generate this url, but user still has to be prompted to specify on the app's page!
    console.log("(OAuth2 tab) On the tab, for the Redirection URL, enter", domain);
    redirurl = readlineSync.question("             Select scopes 'identify' and 'guilds' and copy the generated URL: ");
   
    // just check if we specified anything
    if (redirurl.length !== 0) {
        break;
    }
    console.log("Invalid value! Must be a domain name (http(s)://) or an IP address.");
}

let token;
while (true) {
    token = readlineSync.question("(Bot tab) Create a bot (if you haven't already) and enter its TOKEN: ");
    // 59 bytes long
    if (token.length === 59) {
        break;
    }
    console.log("Invalid value! Must be 59 bytes long.");
}

let pkey;
while (true) {
    pkey = readlineSync.question("OPTIONAL: Path to a private key file for https: ");
    //Either empty, or existing file (warning if not)
    if (pkey.length === 0) {
        // allow empty
        break;
    } else if (!fs.existsSync(pkey)) {
        // does not exist
        console.log("Warning: File does not exist!");
        break;
    } else {
        //exists
        break;
    }
}

let cert;
while (true){
    cert = readlineSync.question("OPTIONAL: Path to a certificate file for https: ");
    //Either empty, or existing file (warning if not)
    if (cert.length === 0) {
        // allow empty
        break;
    } else if (!fs.existsSync(cert)) {
        // does not exist
        console.log("Warning: File does not exist!");
        break;
    } else {
        //exists
        break;
    }
}

// Create and populate application config file
console.log("Creating required files...");

let data = `{
  "token": "${token}",
  "applicationId": "${appId}",
  "oauth2Secret": "${appSecret}",
  "redirectURI": "${domain}",
  "privateKey": "${pkey}",
  "certificate": "${cert}"
}`;

fs.writeFileSync(appcfg, data, function (err) {
    if (err) {
        console.log("Error writing bot.json: ", err);
    }
});

data = `window.Discotron.config = {
    inviteLink: "https://discordapp.com/oauth2/authorize?client_id=${appId}&scope=bot&permissions=0",
    oauthURL: "${redirurl}"
};`;

fs.writeFile(dashcfg, data, function (err) {
    if (err) {
        console.log("Error writing dashboard.js: ", err);
    }
});

fs.writeFile(footprint, "");

console.log("Finished installation!");
