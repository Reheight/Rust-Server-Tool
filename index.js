const { Client } = require('rustrcon');
const Discord = require('discord.js');
const fetch = require('node-fetch');
const config = require("./config");

config.Servers.forEach((server, index) => {
    server.name = `${server.IP}:${server.Port}/${index}`;
    server.rcon = new Client({
        ip: server.IP,
        port: server.Port,
        password: server.RconPassword
    });
    server.connected = false;
    server.bot = new Discord.Client();
    server.bot.login(server.DiscordToken);

    server.bot.on('ready', () => {
        console.log(`Successfully launched: ${server.bot.user.tag}`);
        server.bot.user.setActivity("Attempting connection...");
        attemptConnection();
    });

    server.rcon.on('connected', () => {
        console.log(`Successfully connected to ${server.rcon.ws.ip}:${server.rcon.ws.port}`);

        server.bot.user.setActivity("Monitoring chat...");
    });

    server.rcon.on('error', (err) => {
    });

    server.rcon.on('disconnect', () => {
        server.bot.user.setActivity("Currently offline...");
        attemptConnection();
    });

    server.rcon.on('message', async (message) => {
        const mType = message["Type"];

        switch (mType) {
            case "Chat":
                const mContent = message["content"];

                const channel = mContent["Channel"];
                const chatmessage = mContent["Message"];
                const user = mContent["UserId"];
                const username = mContent["Username"];
                const time = new Date(mContent["Time"] * 1000);
                const avatar = await fetchAvatarURI(user).catch(err => console.log(err));

                const messageLog = new Discord.MessageEmbed()
                    .setFooter(server.ServerIdentifier)
                    .setColor(server.EmbedColor)
                    .setDescription(
                        `[${cleanText(username)}](https://www.steamcommunity.com/profiles/${user}) - ${channel == 1 ? "Team" : "Global"} Chat\n\n` +
                        cleanText(chatmessage)
                    )
                    .setTimestamp(time)
                    .setThumbnail(avatar);

                server.bot.guilds.fetch(server.DiscordServerGuildID)
                        .then(guild => {
                            guild.channels.cache.get(server.MessageLogChannel)
                                .send({ disableMentions: "all" , embed: messageLog });
                        })
                        .catch(err => console.log(err));
                    
                break;
        }
    })

    function attemptConnection() {
        server.rcon.login();
    }

    function cleanText(text) {
        let cleanedText = Discord.Util.escapeMarkdown(text);
        cleanedText = Discord.Util.removeMentions(cleanedText);

        return cleanedText;
    }

    function fetchAvatarURI(SteamID) {
        return new Promise(async (resolve, reject) => {
            const request = await fetch(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${config.SteamAPIKey}&steamids=${SteamID}`)
                .catch((err) => {
                    return reject(err);
                });

            if (request.status !== 200)
                return reject(request.statusText);
            
            const data = await request.json();
            
            return resolve(data.response.players[0]["avatar"]);
        });
    }
});
