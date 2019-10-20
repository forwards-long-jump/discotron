const fs = require('fs');
var readlineSync = require('readline-sync');

//Create the directory if it doesnot exist
if (!fs.existsSync('../instance')){
    fs.mkdirSync('../instance')
}

//Check if some files are already existing
const APPCFG = '../instance/bot.json'
if (fs.existsSync(APPCFG)) {
    console.log("File", APPCFG, " already exists, but installation was not run yet!")
    console.log("Please delete the file to re-run the installation.");
    process.exit(0);
}

const DASHCFG = '../instance/dashboard.js'
if (fs.existsSync(DASHCFG)) {
    console.log("File", DASHCFG, " already exists, but installation was not run yet!")
    console.log("Please delete the file to re-run the installation.");
    process.exit(0);
}

console.log("=== Discotron Install Script ===");
console.log("This script will create a default configuration in the 'instance' folder to get the bot up and running.");
console.log("If you haven't already, visit https://discordapp.com/developers/applications/ and create a new application for Discotron. The following information is retrieved from the application's page and settings. (The tab name and text box label is specified for each prompt.)");

var appId;
while (true) {
    appId = readlineSync.question("(General Information tab) Enter the application's CLIENT ID: ");
    if (appId.match(/^[0-9]+$/) != null) {
        break;
    }
    console.log("Invalid value! Must be numeric.");
}

var appSecret;
while (true){
 appSecret= readlineSync.question("(General Information tab) Enter the CLIENT SECRET: ");
// 32 bytes long
   if(appSecret.length != 32){
      console.log("Invalid value! Must be numeric.");
      continue;
    }
   break;
}

var domain;
while (true){
  domain=readlineSync.question("IP address or domain name to access the dashboard from (if not set, localhost is used): ");

  // 32 bytes long
  if(domain.length==0){
      // fallback value: localhost
        domain='http://localhost:47131';
        break;
    }
    //correctly specified
   break;
}

// Force slash suffix
if(!domain.endsWith('/')){
  domain=domain+"/";
}

// todo: this must always include the port of our web server, else redirection will cause oauth errors!
domain+="dashboard/login.html";

var redirurl;
while(true){
    // todo we could auto-generate this url, but user still has to be prompted to specify on the app's page!
   console.log("(OAuth2 tab) On the tab, for the Redirection URL, enter",domain);
   redirurl=readlineSync.question("             Select scopes 'identify' and 'guilds' and copy the generated URL: ");
   
   // just check if we specified anything
   if(redirurl.length==0){
     console.log("Invalid value! Must be a domain name (http(s)://) or an IP address.");
     continue;
   }
   break;
}

var token;
while(true){
    token=readlineSync.question("(Bot tab) Create a bot (if you haven't already) and enter its TOKEN: ");
  // 59 bytes long
  if(token.length!=59){
    console.log("Invalid value! Must be 59 bytes long.");
    continue;
  }
  break;
}

var pkey;
while(true){
    pkey=readlineSync.question("OPTIONAL: Path to a private key file for https: ");
 //Either empty, or existing file (warning if not)
 if(pkey.length==0){
   // allow empty
   break;
 }
 else if(! fs.existsSync(pkey)){
   // does not exist
   console.log("Warning: File does not exist!");
   break;
 }
 else{
   //exists
   break;
 }
}

var cert;
while (true){
    cert=readlineSync.question("OPTIONAL: Path to a certificate file for https: ");
//Either empty, or existing file (warning if not)
 if(cert.length==0){
   // allow empty
   break;
 }
 else if(! fs.existsSync(cert)){
   // does not exist
   console.log("Warning: File does not exist!");
   break;
 }
 else{
   //exists
   break;
 }
}

// Create and populate application config file
console.log("Creating required files...");

data=`{
  "token":"${token}",
  "applicationId":"${appId}",
  "oauth2Secret": "${appSecret}",
  "redirectURI":"${domain}",
  "privateKey": "${pkey}",
  "certificate": "${cert}"
}`

fs.writeFileSync(APPCFG, data, function (err,result) {
    if (err){
      console.log(err)
    }
})

data = `window.Discotron.config = {
    inviteLink: "https://discordapp.com/oauth2/authorize?client_id=$appid&scope=bot&permissions=0",
    oauthURL: "${redirurl}"
}`

fs.writeFile(DASHCFG,data,function (err,result){
console.log(result);
    if (err){
      console.log(err);
    }
});

console.log("Finished installation!");