const { SlashCommandBuilder } = require("discord.js");
const { ec: EC } = require("elliptic");
const crypto = require("crypto");
const axios = require("axios");
const { decryptAES } = require("../utils/crypto");
const ec = new EC("secp256k1");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("send-hmc")
        .setDescription("Gửi coin từ ví đã mã hoá")
        .addStringOption(opt =>
            opt.setName("encrypted")
                .setDescription("Private key đã mã hoá AES")
                .setRequired(true)
        )
        .addStringOption(opt =>
            opt.setName("password")
                .setDescription("Mật khẩu để giải mã private key")
                .setRequired(true)
        )
        .addStringOption(opt =>
            opt.setName("to")
                .setDescription("Địa chỉ nhận")
                .setRequired(true)
        )
        .addNumberOption(opt =>
            opt.setName("amount")
                .setDescription("Số lượng HMC muốn gửi")
                .setRequired(true)
        ),

    async execute(interaction) {
        const encrypted = interaction.options.getString("encrypted");
        const password = interaction.options.getString("password");
        const to = interaction.options.getString("to");
        const amount = interaction.options.getNumber("amount");

        try {
            const decrypted = decryptAES(encrypted, password);
            if (!decrypted || decrypted.length < 64) {
                return await interaction.reply({ ephemeral: true, content: "❌ Private key không hợp lệ. Có thể do sai mật khẩu hoặc chuỗi mã hóa hỏng." });
            }

            const key = ec.keyFromPrivate(decrypted);
            const from = key.getPublic("hex");
            const tx = {
                from,
                to,
                amount,
                timestamp: Date.now(),
            };

            const msg = tx.from + tx.to + tx.amount + tx.timestamp;
            const hash = crypto.createHash("sha256").update(msg).digest();
            const signature = key.sign(hash, "hex").toDER("hex");
            tx.signature = signature;

            await axios.post("http://localhost:3000/api/transaction", tx);

            await interaction.reply({ ephemeral: true, content: "✅ Giao dịch đã gửi thành công!" });
        } catch (err) {
            console.error("❌ Lỗi khi gửi giao dịch:", err);
            await interaction.reply({ ephemeral: true, content: "❌ Lỗi khi gửi giao dịch: " + err.message });
        }
    }
};
