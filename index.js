require("dotenv").config();
const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes } = require("discord.js");
const bip39 = require("bip39");
const { ec: EC } = require("elliptic");
const CryptoJS = require("crypto-js");
const ec = new EC("secp256k1");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Tạo các slash command
const commands = [
    new SlashCommandBuilder()
        .setName("taovi")
        .setDescription("Tạo ví HeavenMine mới")
        .addStringOption(opt =>
            opt.setName("password")
                .setDescription("Mật khẩu để mã hoá private key")
                .setRequired(true)
        ),
    new SlashCommandBuilder()
        .setName("khoiphuc")
        .setDescription("Phục hồi ví từ mnemonic và mật khẩu")
        .addStringOption(opt =>
            opt.setName("mnemonic")
                .setDescription("12 từ khôi phục")
                .setRequired(true)
        )
        .addStringOption(opt =>
            opt.setName("password")
                .setDescription("Mật khẩu mới dùng để mã hoá private key")
                .setRequired(true)
        )
].map(cmd => cmd.toJSON());

// Đăng ký lệnh
const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands })
    .then(() => console.log("✅ Slash commands đã được cập nhật"))
    .catch(console.error);

// Xử lý lệnh
client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === "taovi") {
        const password = interaction.options.getString("password");
        const mnemonic = bip39.generateMnemonic();
        const seed = bip39.mnemonicToSeedSync(mnemonic).slice(0, 32);
        const key = ec.keyFromPrivate(seed);
        const privateKey = key.getPrivate("hex");
        const publicKey = key.getPublic("hex");

        const encrypted = encryptAES(privateKey, password);

        await interaction.reply({
            ephemeral: true,
            content: `✅ **Ví đã tạo thành công!**\n\n` +
                `🔑 **Mnemonic:**\n\`\`\`${mnemonic}\`\`\`\n` +
                `🔐 **Private Key (mã hoá):**\n\`\`\`${encrypted}\`\`\`\n` +
                `🪪 **Public Key (Địa chỉ ví):**\n\`\`\`${publicKey}\`\`\`\n` +
                `⚠️ Lưu lại Mnemonic và mật khẩu, không thể khôi phục nếu mất.`
        });
    }

    if (interaction.commandName === "khoiphuc") {
        const mnemonic = interaction.options.getString("mnemonic").trim();
        const password = interaction.options.getString("password");

        if (!bip39.validateMnemonic(mnemonic)) {
            return await interaction.reply({ ephemeral: true, content: "❌ Mnemonic không hợp lệ!" });
        }

        try {
            const seed = bip39.mnemonicToSeedSync(mnemonic).slice(0, 32);
            const key = ec.keyFromPrivate(seed);
            const privateKey = key.getPrivate("hex");
            const publicKey = key.getPublic("hex");

            const encrypted = encryptAES(privateKey, password);

            await interaction.reply({
                ephemeral: true,
                content: `♻️ **Phục hồi ví thành công!**\n\n` +
                    `🔐 **Private Key (mã hoá):**\n\`\`\`${encrypted}\`\`\`\n` +
                    `🪪 **Public Key (Địa chỉ ví):**\n\`\`\`${publicKey}\`\`\`\n` +
                    `⚠️ Kiểm tra kỹ trước khi dùng.`
            });
        } catch (err) {
            await interaction.reply({ ephemeral: true, content: "❌ Có lỗi xảy ra: " + err.message });
        }
    }
});

// AES mã hoá
function encryptAES(text, pass) {
    const key = CryptoJS.SHA256(pass);
    const iv = CryptoJS.lib.WordArray.random(16);
    const encrypted = CryptoJS.AES.encrypt(text, key, { iv });
    return iv.toString() + encrypted.toString();
}

client.once("ready", () => {
    console.log(`🤖 Bot hoạt động: ${client.user.tag}`);
});
client.login(process.env.DISCORD_TOKEN);
