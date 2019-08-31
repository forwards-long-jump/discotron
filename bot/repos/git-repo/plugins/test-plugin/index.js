module.exports.config = {
    name: "Test",
    desc: "Not much, but at least it works",
    version: "1.1.0",
    author: "Bürki",
    onLoad: (client) => {} 
};

module.exports.commands = [
    {
        triggerType: "command",
        trigger: "echo",
        help: "Says hello",
        args: [{name: "text", defaultValue: "Hello World !", help: "Text to repeat."}],
        defaultPermission: "everyone",
        ownerOnly: false,
        scope: "everywhere",
        action: echo
    },
    {
        triggerType: "trigger",
        trigger: ["what", "time"],
        help: "Gives the time enthusiastically",
        args: [],
        defaultPermission: "everyone",
        ownerOnly: false,
        scope: "everywhere",
        action: explain
    }
];


function echo(args, message) {
    message.channel.send(args.text);
}

function explain(args, message) {
    let now = new Date();
    message.channel.send("It is now " + now.getHours() + ":" + now.getMinutes() + " my dude.");
}