const { SlashCommandBuilder, EmbedBuilder, WebhookClient } = require("discord.js");
const { canRequestAirdrop, updateAirdropTimestamp } = require("../utils/airdropLimiter");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("airdrop")
        .setDescription("Yêu cầu nhận airdrop HMC (1 lần / 24 giờ)")
        .addStringOption(opt =>
            opt.setName("address")
                .setDescription("Địa chỉ ví (public key) của bạn")
                .setRequired(true)
        ),

    async execute(interaction) {
        const address = interaction.options.getString("address").trim();
        const user = interaction.user;

        if (!canRequestAirdrop(user.id)) {
            return interaction.reply({
                ephemeral: true,
                content: `⏳ Bạn đã xin airdrop gần đây.\nVui lòng thử lại sau **24 giờ** kể từ lần trước.`
            });
        }

        // ✅ Ghi nhận thời gian mới
        updateAirdropTimestamp(user.id);

        // ✅ Phản hồi người dùng
        await interaction.reply({
            ephemeral: true,
            content: `✅ Yêu cầu airdrop của bạn đã được ghi nhận!\n🔍 Admin sẽ xem xét sớm.`
        });

        // ✅ Gửi tới webhook
        const webhook = new WebhookClient({ url: process.env.AIRDROP_WEBHOOK_URL });
        const embed = new EmbedBuilder()
            .setTitle("🪂 Yêu cầu Airdrop mới")
            .setColor(0x00ff00)
            .addFields(
                { name: "👤 User", value: `${user.tag} (${user.id})` },
                { name: "🪪 Ví Public Key", value: `\`${address}\`` },
                { name: "⏰ Thời gian", value: `<t:${Math.floor(Date.now() / 1000)}:F>` }
            )
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: "HeavenMine Airdrop System" });

        await webhook.send({ embeds: [embed] });
    }
};
