const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const bip39 = require("bip39");
const { ec: EC } = require("elliptic");
const { encryptAES } = require("../utils/crypto");
const ec = new EC("secp256k1");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("taovi")
        .setDescription("Tạo ví HeavenMine mới")
        .addStringOption(opt =>
            opt.setName("password")
                .setDescription("Mật khẩu để mã hoá private key")
                .setRequired(true)
        ),

    async execute(interaction) {
        const password = interaction.options.getString("password");
        const mnemonic = bip39.generateMnemonic();
        const seed = bip39.mnemonicToSeedSync(mnemonic).slice(0, 32);
        const key = ec.keyFromPrivate(seed);
        const privateKey = key.getPrivate("hex");
        const publicKey = key.getPublic("hex");
        const encrypted = encryptAES(privateKey, password);

        const embed = new EmbedBuilder()
            .setTitle("🆕 Ví HeavenMine Đã Được Tạo")
            .setColor(0x00bfff) // Xanh biển
            .addFields(
                { name: "🔑 Mật khẩu bạn đã nhập", value: `\`${password}\`` },
                { name: "🧠 Mnemonic (12 từ khôi phục)", value: `\`\`\`${mnemonic}\`\`\`` },
                { name: "🔐 Private Key (đã mã hoá)", value: `\`\`\`${encrypted}\`\`\`` },
                { name: "🏦 Public Key (Địa chỉ ví)", value: `\`\`\`${publicKey}\`\`\`` },
                { name: "📌 Lưu ý", value: "Hãy lưu trữ Mnemonic và mật khẩu ở nơi an toàn. Mất chúng là mất ví vĩnh viễn!" }
            )
            // .setFooter({ text: "⚠️ Lưu kỹ thông tin này. Mất Mnemonic hoặc mật khẩu là mất ví vĩnh viễn." })
            .setTimestamp();

        await interaction.reply({ ephemeral: true, embeds: [embed] });
    }
};
