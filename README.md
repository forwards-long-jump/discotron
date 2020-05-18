# Discotron
[![Discord](https://img.shields.io/discord/612920539723595786?label=Discotron&logo=discord&logoColor=fff)](https://discord.gg/eq9djCR)

Modular Discord bot supporting plugins hosted on git repositories.

# Introduction
Usually, a Discord bot has a certain set of commands which are available to everyone part of a certain role in a server. They are not very configurable, and to get the desired results, you usually end up adding many different bots to your server instead.

Discotron aims to solve this problem by allowing you to construct a single bot which can be customized over a web interface - [the dashboard](https://github.com/forwards-long-jump/discotron/wiki/Dashboard).
It'll be made up of multiple [plugins](https://github.com/forwards-long-jump/discotron/wiki/Plugin-structure) which each have a certain feature set.
This bot can then be invited to one or more servers, where it can then be further customized for each server individually (disable certain plugins, change their command prefix, select roles etc.).

![Screenshot of Dashboard](https://orikaru.net/dl/discotron-demo.png)

Because of this modular design, you can either use a [Discotron instance](https://github.com/forwards-long-jump/discotron/wiki/Configuration-files) hosted by someone else, or create your own if you like. By default, the server admins can access their own server on the dashboard to then configure the bot to their likings.

## Inviting Discotron to my server
If you know someone hosting Discotron and would like to invite that instance to your server, simply [follow these instructions](https://github.com/forwards-long-jump/discotron/wiki/Dashboard#Invite).

## Hosting Discotron myself
To host an instance yourself, check out the [installation guide](https://github.com/forwards-long-jump/discotron/wiki/Installation) to get started.

Further reading:

- [Discotron Dashboard](https://github.com/forwards-long-jump/discotron/wiki/Dashboard)

## Adding custom commands to Discotron
If you want to add new functionality to Discotron, simply [find a plugin that does what you want](https://github.com/forwards-long-jump/discotron/wiki/Dashboard#Plugins)!

Alternatively, you can create your own plugin. Some useful resources to get you started:

- [Code conventions](https://github.com/forwards-long-jump/discotron/wiki/Coding-conventions)
- [Installation](https://github.com/forwards-long-jump/discotron/wiki/Installation)
- [Creating a plugin](https://github.com/forwards-long-jump/discotron/wiki/Plugin-structure)

## Contributing to Discotron directly
The easiest way to help us out is by reporting bugs and suggesting features [on the issues page](https://github.com/forwards-long-jump/discotron/issues)!

If you actually feel like digging into the code, check out the following resources:

- [Code conventions](https://github.com/forwards-long-jump/discotron/wiki/Coding-conventions)
- [Installation](https://github.com/forwards-long-jump/discotron/wiki/Installation)

When in doubt, feel free to talk to us instead of relying solely on the above resources and the source code!

# Join our Discord server
You can join the official [Discotron server](https://discord.gg/eq9djCR) if you want to discuss anything related to Discotron or if you need help.

We're happy to talk to you and you can mess around with a self-hosted instance of Discotron as well!
