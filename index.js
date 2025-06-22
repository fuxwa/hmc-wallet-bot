require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Client, GatewayIntentBits, Collection, REST, Routes } = require("discord.js");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

// Load lệnh từ thư mục ./commands
const commands = [];
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
}

// Đăng ký lệnh với Discord API
const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands })
    .then(() => console.log("✅ Slash commands đã được đăng ký"))
    .catch(console.error);

client.on("ready", () => {
    console.log(`🤖 Bot hoạt động: ${client.user.tag}`);
});

// Xử lý tương tác
client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (err) {
        console.error(err);
        await interaction.reply({ ephemeral: true, content: "❌ Có lỗi xảy ra khi xử lý lệnh!" });
    }
});

client.login(process.env.DISCORD_TOKEN);
