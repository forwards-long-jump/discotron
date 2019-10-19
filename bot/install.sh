#!/usr/bin/env bash

# We leave behind a file which remembers if we ran the install script
FOOTPRINT=../instance/.installed
if [[ -f "$FOOTPRINT" ]]; then
    echo "Discotron install script already finished, skipping."
    echo ""
    exit
fi

#Check if some files are already existing
APPCFG=../instance/bot.json
if [[ -f "$APPCFG" ]]; then
    echo "File $APPCFG already exists, but installation was not run yet!"
    echo "Please delete the file to re-run the installation."
    echo ""
    exit
fi
DASHCFG=../instance/dashboard.js
if [[ -f "$DASHCFG" ]]; then
    echo "File $DASHCFG already exists, but installation was not run yet!"
    echo "Please delete the file to re-run the installation."
    echo ""
    exit
fi

echo "=== Discotron Install Script ==="
echo ""
echo "This script will create a default configuration in the 'instance' folder to get the bot up and running."
echo ""
echo "If you haven't already, visit https://discordapp.com/developers/applications/"
echo "and create a new application for Discotron. The following information is retrieved"
echo "from the application's page and settings. (The tab name and text box label is specified for each prompt.)"
echo ""

while : ; do
    read -p "(General Information tab) Enter the application's CLIENT ID: " appid
    # Snowflake, can't easily verify besides being numeric
    [[ ! "$appid" =~ ^[0-9]+$ ]] || break
    echo "Invalid value! Must be numeric."
done

while : ; do
    read -p "(General Information tab) Enter the CLIENT SECRET: " appsecret
    # 32 bytes long
    [[ ${#appsecret} != 32 ]] || break
    echo "Invalid value! Must be 32 bytes long."
done

while : ; do
    read -p "IP address or domain name to access the dashboard from (if not set, localhost is used): " domain
    # Either empty, or matching a domain-like regex
    if [[ -z "$domain" ]]; then
        # fallback value: localhost
        domain=http://localhost
        break
    else
        # correctly specified
        break
    fi
done

# Force slash suffix
if [[ ! "$domain" =~ ^.+/$ ]]; then
    domain="$domain/"
fi
domain="${domain}dashboard/login.html"

while : ; do
    # todo we could auto-generate this url, but user still has to be prompted to specify on the app's page!
    echo "(OAuth2 tab) On the tab, for the Redirection URL, enter $domain"
    read -p "             Select scopes 'identify' and 'guilds' and copy the generated URL: " redirurl
    # just check if we specified anything
    [[ -z "$redirurl" ]] || break
    echo "Invalid value! Must be a domain name (http(s)://) or an IP address."
done

while : ; do
    read -p "(Bot tab) Create a bot (if you haven't already) and enter its TOKEN: " token
    # 59 bytes long
    [[ ${#token} != 59 ]] || break
    echo "Invalid value! Must be 59 bytes long."
done

while : ; do
    read -p "OPTIONAL: Path to a private key file for https: " pkey
    # Either empty, or existing file (warning if not)
    if [[ -z "$pkey" ]]; then
        # allow empty
        break
    elif [[ ! -f "$pkey" ]]; then
        # does not exist
        echo "Warning: File does not exist!"
        break
    else
        # exists
        break
    fi
done

while : ; do
    read -p "OPTIONAL: Path to a certificate file for https: " cert
    # Either empty, or existing file (warning if not)
    if [[ -z "$pkey" ]]; then
        # allow empty
        break
    elif [[ ! -f "$pkey" ]]; then
        # does not exist
        echo "Warning: File does not exist!"
        break
    else
        # exists
        break
    fi
done

# Create and populate application config file
echo "Creating required files..."

echo "{
    \"token\": \"$token\",
    \"applicationId\": \"$appid\",
    \"oauth2Secret\": \"$appsecret\",
    \"redirectURI\": \"$domain\",
    \"privateKey\": \"$pkey\",
    \"certificate\": \"$cert\"
}" > "$APPCFG"

echo "window.Discotron.config = {
    inviteLink: \"https://discordapp.com/oauth2/authorize?client_id=$appid&scope=bot&permissions=0\",
    oauthURL: \"$redirurl\"
};" > "$DASHCFG"

# We are done, remember this
touch "$FOOTPRINT"
echo "Finished installation!"
echo ""
