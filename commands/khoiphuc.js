const { SlashCommandBuilder } = require("discord.js");
const bip39 = require("bip39");
const { ec: EC } = require("elliptic");
const { encryptAES } = require("../utils/crypto");
const ec = new EC("secp256k1");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("khoiphuc")
        .setDescription("Phục hồi ví từ mnemonic và mật khẩu")
        .addStringOption(opt =>
            opt.setName("mnemonic")
                .setDescription("12 từ khôi phục")
                .setRequired(true)
        )
        .addStringOption(opt =>
            opt.setName("password")
                .setDescription("Mật khẩu mới để mã hoá private key")
                .setRequired(true)
        ),

    async execute(interaction) {
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
                content:
                    `♻️ **Phục hồi ví thành công!**\n\n` +
                    `🔐 **Private Key (mã hoá):**\n${encrypted}\n` +
                    `🪪 **Public Key (Địa chỉ ví):**\n${publicKey}\n` +
                    `⚠️ Kiểm tra kỹ trước khi dùng.`
            });
        } catch (err) {
            await interaction.reply({ ephemeral: true, content: "❌ Có lỗi xảy ra: " + err.message });
        }
    }
};
