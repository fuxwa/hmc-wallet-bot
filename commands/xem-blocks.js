const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const axios = require("axios");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("xem-blocks")
        .setDescription("Xem toàn bộ blockchain (có phân trang)"),

    async execute(interaction) {
        const res = await axios.get("http://localhost:3000/api/blocks");
        const blocks = res.data;

        if (!Array.isArray(blocks) || blocks.length === 0) {
            return interaction.reply({ ephemeral: true, content: "❌ Blockchain hiện đang trống." });
        }

        const pageSize = 3;
        let page = 0;

        const createEmbed = (page) => {
            const start = page * pageSize;
            const end = start + pageSize;
            const current = blocks.slice(start, end);

            const embed = new EmbedBuilder()
                .setTitle("📦 Blockchain Viewer")
                .setColor(0xfacc15)
                .setFooter({ text: `Trang ${page + 1} / ${Math.ceil(blocks.length / pageSize)}` })
                .setTimestamp();

            current.forEach(block => {
                embed.addFields({
                    name: `🔹 Block #${block.index}`,
                    value:
                        `⛓️ Hash: \`${block.hash.slice(0, 16)}...\`\n` +
                        `🧱 Prev: \`${block.previousHash.slice(0, 16)}...\`\n` +
                        `📄 Tx count: ${block.transactions.length} | 🕒 ${new Date(block.timestamp).toLocaleString()}\n` +
                        `⚙️ Nonce: ${block.nonce}`
                });
            });

            return embed;
        };

        const getButtons = (page) => {
            return new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("prev")
                    .setLabel("◀ Trang trước")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page === 0),

                new ButtonBuilder()
                    .setCustomId("next")
                    .setLabel("Trang sau ▶")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled((page + 1) * pageSize >= blocks.length)
            );
        };

        await interaction.reply({
            ephemeral: true,
            embeds: [createEmbed(page)],
            components: [getButtons(page)]
        });

        const msg = await interaction.fetchReply();
        const collector = msg.createMessageComponentCollector({ time: 60000 });

        collector.on("collect", async i => {
            if (i.user.id !== interaction.user.id) {
                return i.reply({ ephemeral: true, content: "❌ Bạn không thể điều khiển trang này." });
            }

            if (i.customId === "next") page++;
            if (i.customId === "prev") page--;

            await i.update({
                embeds: [createEmbed(page)],
                components: [getButtons(page)]
            });
        });

        collector.on("end", async () => {
            try {
                await msg.edit({ components: [] });
            } catch (e) { }
        });
    }
};
