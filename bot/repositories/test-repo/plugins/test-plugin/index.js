module.exports.config = {
    name: "Test",
    devname: "test-plugin",
    description: "Not much, but at least it works",
    defaultPermission: "everyone",
    version: "1.1.0",
    author: "Bürki",
    onLoad: (client) => {}
};

module.exports.commands = [{
        triggerType: "command",
        trigger: "echo",
        help: "Says hello",
        args: [{
            name: "text",
            defaultValue: "Hello World !",
            help: "Text to repeat.",
            allowsSpace: true
        }],
        ownerOnly: false,
        scope: "everywhere",
        requiresMention: false,
        byPassSpamDetection: false,
        action: echo
    },
    {
        triggerType: "words",
        trigger: ["what", "time"],
        help: "Gives the time enthusiastically",
        args: [],
        ownerOnly: false,
        scope: "everywhere",
        requiresMention: true,
        byPassSpamDetection: false,
        action: giveTime
    },
    {
        triggerType: "all",
        help: "Helps you win arguments",
        ownerOnly: true,
        action: agree
    }
];


function echo(discordMessage, args) {
    discordMessage.channel.send(args.text);
}

function giveTime(discordMessage, words) {
    let now = new Date();
    discordMessage.channel.send("It is now " + now.getHours() + ":" + ("00" + now.getMinutes()).slice(-2) + " my dude.");
}

function agree(discordMessage) {
    if (Math.random() < 0.05) {
        discordMessage.channel.send("I agree wholeheartedly.");
    }
}