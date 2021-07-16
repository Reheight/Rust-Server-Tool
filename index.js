const { Client } = require("rustrcon");
const Discord = require("discord.js");
const config = require("./config");
let serverStatus = [];

function initiateGlobalBot() {
  const totalPopulationBot = new Discord.Client();

  totalPopulationBot.on("ready", () => {
    setInterval(async () => {
      const totalPop = await getTotalPopulation().catch(() => null);

      if (!totalPop || totalPop == null) return;

      totalPopulationBot.user.setActivity(
        `${totalPop.playersOnline + totalPop.playersQueued} players online!`,
        { type: "PLAYING" }
      );
    }, 20000);
  });

  totalPopulationBot.login(config.MasterBot.DiscordToken).then(() => {
    totalPopulationBot.user.setActivity("Fetching data...");
    console.log(`[${totalPopulationBot.user.tag}] is now online!`);
  });
}

if (config.MasterBot && config.MasterBot.DiscordToken) initiateGlobalBot();

config.Servers.forEach(async (server, index, array) => {
  server.name = `${server.IP}:${server.Port} (#${index + 1})`;
  server.rcon = new Client({
    ip: server.IP,
    port: server.Port,
    password: server.RconPassword,
  });
  server.connected = false;
  server.bot = new Discord.Client();
  server.playerCountUpdate = null;

  server.scheduler = null;

  server.bot.on("ready", () => {
    console.log(`[${server.bot.user.tag}] Successfully launched...`);
    attemptConnection();
  });

  server.rcon.on("connected", () => {
    server.connected = true;

    console.log(
      `[${server.bot.user.tag}] Successfully connected to ${server.rcon.ws.ip}:${server.rcon.ws.port}`
    );

    const onlineEmbed = new Discord.MessageEmbed()
      .setTitle("Server Status")
      .setColor(server.EmbedColor)
      .setDescription(`${server.ServerIdentifier} is now online!`)
      .setTimestamp()
      .setThumbnail(server.ServerLogo);

    server.bot.guilds
      .fetch(server.DiscordServerGuildID)
      .then((guild) => {
        guild.channels.cache
          .get(server.StatusChannel)
          .send({ disableMentions: "all", embed: onlineEmbed });
      })
      .catch((err) => console.log(err));

    server.bot.user.setActivity("Fetching data...");

    server.playerCountUpdate = setInterval(() => {
      try {
        server.rcon.send("serverinfo", "Reheight", 88724);
      } catch (err) {
        logError(err);
      }
    }, 20000);
  });

  server.rcon.on("error", (err) => {
    logError(err.message);
  });

  function logError(err) {
    console.log(
      `[${server.bot.user.tag}] There was an issue while connecting to ${server.name}...\n\n---------[ERROR]---------\n\n${err}\n\n-------------------------\n`
    );
  }

  server.rcon.on("disconnect", () => {
    clearInterval(server.playerCountUpdate);

    serverStatus[index] = { playersOnline: 0, queuedPlayers: 0 };

    const offlineEmbed = new Discord.MessageEmbed()
      .setTitle("Server Status")
      .setColor(server.EmbedColor)
      .setDescription(`${server.ServerIdentifier} has gone offline!`)
      .setTimestamp()
      .setThumbnail(server.ServerLogo);

    if (server.connected) {
      server.bot.guilds
        .fetch(server.DiscordServerGuildID)
        .then((guild) => {
          guild.channels.cache
            .get(server.StatusChannel)
            .send({ disableMentions: "all", embed: offlineEmbed });
        })
        .catch((err) => console.log(err));

        server.bot.user.setActivity("Currently offline...");

        server.connected = false;

        console.log(
          `[${server.bot.user.tag}] RCON disconnected from ${server.name}, will try to re-establish connection!`
        );
    } else {
      console.log(
        `[${server.bot.user.tag}] RCON attempting to establish connection to ${server.name}!`
      );
    }

    attemptConnection();
  });

  server.rcon.on("message", async (message) => {
    const mType = message["Type"];
    const mContent = message["content"];
    const mIdentifier = message["Identifier"];

    switch (mType) {
      case "Chat":
        const channel = mContent["Channel"];
        const chatmessage = mContent["Message"];
        const user = mContent["UserId"];
        const username = mContent["Username"];
        const time = new Date(mContent["Time"] * 1000);

        const messageLog = new Discord.MessageEmbed()
          .setFooter(server.ServerIdentifier)
          .setColor(server.EmbedColor)
          .setDescription(
            `[${cleanText(
              username
            )}](https://www.steamcommunity.com/profiles/${user}) - ${
              channel == 1 ? "Team" : "Global"
            } Chat\n\n` + cleanText(chatmessage)
          )
          .setTimestamp(time);

        server.bot.guilds
          .fetch(server.DiscordServerGuildID)
          .then((guild) => {
            guild.channels.cache
              .get(server.MessageLogChannel)
              .send({ disableMentions: "all", embed: messageLog });
          })
          .catch((err) => console.log(err));

        break;
      case "Generic":
        if (mIdentifier === 88724) {
          const playersOnline = mContent["Players"];
          const maxPlayers = mContent["MaxPlayers"];
          const queuedPlayers = mContent["Queued"] + mContent["Joining"];

          serverStatus[index] = {
            playersOnline,
            queuedPlayers,
          };

          server.bot.user.setActivity(
            `(${playersOnline}/${maxPlayers}) ⇋ (${queuedPlayers} Joining)`,
            {
              type: "PLAYING",
            }
          );
        }

        break;
    }
  });

  function attemptConnection() {
    console.log(
      `[${server.bot.user.tag}] Attempting to connect to ${server.name}`
    );
    server.rcon.login();
  }

  function cleanText(text) {
    let cleanedText = Discord.Util.escapeMarkdown(text);
    cleanedText = Discord.Util.removeMentions(cleanedText);

    return cleanedText;
  }
  
  server.bot.login(server.DiscordToken);
});

async function getTotalPopulation() {
  return new Promise((res, rej) => {
    if (serverStatus.length === 0) rej("No servers yet exist in the array!");

    let totalData = { playersOnline: 0, playersQueued: 0 };

    serverStatus.forEach(({ playersOnline, queuedPlayers }, index, array) => {
      totalData.playersOnline += playersOnline;
      totalData.playersQueued += queuedPlayers;

      if (index === array.length - 1) res(totalData);
    });
  });
}
