This utility will allow you to have your entire server chat dumped into a single channel on Discord. You can easily search through the messages with their Steam ID and the server it is on.  
  
# Requirements  
- Your own Discord Bot  
- Your own Steam API key  
- Discord Server  
- Access to RCON  
- Node JS  

# What makes this different from others?
The reason why this chat logger is going to be significantly better for you to use rather than using some other plugin for logging chat to Discord is that once you obtain a growing playerbase then you will begin to lag as chat becomes more active which will cause the plugin to work harder on sending messages to the Discord bot which will cause stress on the server. This chat logger however will take advantage of RCON and will run separately from the server, meaning the server won't lose a single ounce of performance with this.
  
# Attention  
You will need to have Node JS installed on the machine that will be running this! If you do not have that yet installed, then you may install it [here](https://nodejs.org/en/)!  
  
# Setup  
1. Open config.yml with a file editor.  
2. Visit https://discord.com/developers/applications  
3. Login and then select "New Application" in the top right.  
4. Once you created the application select the "Bot" tab and then select "Add Bot".  
5. Click the "Copy" button under the section called "Token".  
6. Paste the token in the config file where it says "DiscordToken".  
7. Invite the bot to your Discord server.  
7. Visit https://www.steamcommunity.com/dev/apikey  
9. If you haven't created a API Key already then create one.  
10. Copy the API key you were assigned and paste it in the config where it says "SteamAPIKey".  
11. Open Discord and go to your setting.  
12. Select appearance and scroll down until you see "Developer Mode" and enable it.  
13. Find your Discord server in the server list and right click the icon and select "Copy ID".  
14. Paste this ID inside of the config where it says "DiscordServerGuildID".  
15. Right click the channel where you want the messages to go in your Discord and select "Copy ID".  
16. Paste this ID inside of your config where it says "MessageLogChannel".
18. Right click on the channel where you want public status updates to be sent and select "Copy ID".
19. Paste this ID inside of your config where it says "StatusChannel".
20. Upload an image that represents the server to a CDN (such as [imgur](https://www.imgur.com)).
21. Paste the link to the image inside of your config where it says "ServerLogo".
22. Set the name for your server inside of your config where it says "ServerIdentifier".
23. Ensure you have RCON enabled correctly (Learn more [here](https://www.rustafied.com/how-to-host-your-own-rust-server) by looking at launch options).  
24. Inside of the config replace "IP" with the IP to your Rust server, "Port" with the port your RCON is on, and "RconPassword" with the password you set for RCON.  
25. Save the config file.  
26. Run start.bat  
  
# Configuration  
```  
{
  "INFORMATION": "You will need to obtain a Discord Bot Token (https://discord.com/developers/applications) and a Steam API Key (https://steamcommunity.com/dev/apikey) from the links provided!",
  "MasterBot": {
    "DiscordToken": "BOT TOKEN"
  },
  "Servers": [
    {
      "IP": "SERVER IP ADDRESS",
      "Port": RCON PORT,
      "RconPassword": "RCON PASSWORD",
      "DiscordToken": "DISCORD BOT TOKEN",
      "DiscordServerGuildID": "GUILD ID",
      "MessageLogChannel": "MESSAGE LOG CHANNEL ID",
      "StatusChannel": "STATUS CHANNEL ID",
      "ServerLogo": "LINK TO IMAGE",
      "ServerIdentifier": "CUSTOM NAME FOR SERVER",
      "EmbedColor": "#26ff4e"
    },
    {
      "IP": "SERVER IP ADDRESS",
      "Port": RCON PORT,
      "RconPassword": "RCON PASSWORD",
      "DiscordToken": "DISCORD BOT TOKEN",
      "DiscordServerGuildID": "GUILD ID",
      "MessageLogChannel": "MESSAGE LOG CHANNEL ID",
      "StatusChannel": "STATUS CHANNEL ID",
      "ServerLogo": "LINK TO IMAGE",
      "ServerIdentifier": "CUSTOM NAME FOR SERVER",
      "EmbedColor": "#26ff4e"
    }
  ],
  "SteamAPIKey": "STEAM API KEY"
}
```
