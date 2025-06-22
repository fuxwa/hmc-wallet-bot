const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const axios = require("axios");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("balance")
        .setDescription("Kiểm tra số dư ví HeavenMine")
        .addStringOption(opt =>
            opt.setName("address")
                .setDescription("Địa chỉ ví (public key)")
                .setRequired(true)
        ),

    async execute(interaction) {
        const address = interaction.options.getString("address").trim();

        try {
            const res = await axios.get(`${process.env.API_BASE_URL}/api/balance/${address}`);
            const { balance, unit } = res.data;

            const embed = new EmbedBuilder()
                .setTitle("📊 Số Dư HeavenMine Coin")
                .setColor(0x4ade80) // màu xanh lá pastel
                .addFields(
                    { name: "🪪 Địa chỉ ví", value: `\`${address}\`` },
                    { name: "💰 Số dư", value: `\`${balance} ${unit}\`` }
                )
                .setFooter({ text: "📡 Dữ liệu từ node trung tâm" })
                .setTimestamp();

            await interaction.reply({ ephemeral: true, embeds: [embed] });
        } catch (err) {
            console.error("❌ Lỗi kiểm tra số dư:", err.message);
            await interaction.reply({
                ephemeral: true,
                content: `❌ Không thể kiểm tra số dư. Có thể địa chỉ không hợp lệ hoặc node đang lỗi.`
            });
        }
    }
};
