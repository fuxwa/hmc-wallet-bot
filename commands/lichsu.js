const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const axios = require("axios");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("lichsu")
        .setDescription("Xem lịch sử giao dịch của một địa chỉ ví")
        .addStringOption(opt =>
            opt.setName("address")
                .setDescription("Địa chỉ ví (public key)")
                .setRequired(true)
        ),

    async execute(interaction) {
        const address = interaction.options.getString("address").trim();
        let res;

        try {
            res = await axios.get(`http://localhost:3000/api/txs/${address}`);
        } catch (err) {
            return interaction.reply({ ephemeral: true, content: "❌ Không thể lấy dữ liệu. Địa chỉ có thể không tồn tại hoặc node bị lỗi." });
        }

        const txs = res.data;
        if (!Array.isArray(txs) || txs.length === 0) {
            return interaction.reply({ ephemeral: true, content: "📭 Ví này chưa có giao dịch nào." });
        }

        const pageSize = 3;
        let page = 0;

        const formatTx = (tx) => {
            const isOutgoing = tx.from === address;
            const type = isOutgoing ? "🔺 **Gửi đi**" : "🔻 **Nhận vào**";
            const counterparty = isOutgoing ? tx.to : tx.from;
            const counterLabel = isOutgoing ? "👤 Đến" : "👤 Từ";
            const date = new Date(tx.time || tx.timestamp);

            return (
                `${type} • 🕒 ${date.toLocaleString()}\n` +
                `${counterLabel}: \`${counterparty.slice(0, 12)}...${counterparty.slice(-6)}\`\n` +
                `📦 Block: #${tx.blockIndex ?? "?"} | 💰 Số lượng: \`${tx.amount} HMC\``
            );
        };

        const createEmbed = (page) => {
            const start = page * pageSize;
            const end = start + pageSize;
            const current = txs.slice(start, end);

            const embed = new EmbedBuilder()
                .setTitle("📜 Lịch Sử Giao Dịch")
                .setDescription(`🪪 Ví: \`${address.slice(0, 12)}...${address.slice(-6)}\``)
                .setColor(0x38bdf8)
                .setFooter({ text: `Trang ${page + 1} / ${Math.ceil(txs.length / pageSize)}` })
                .setTimestamp();

            current.forEach((tx, i) => {
                embed.addFields({
                    name: `#${start + i + 1}`,
                    value: formatTx(tx)
                });
            });

            return embed;
        };

        const getButtons = (page) => {
            return new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("prev")
                    .setLabel("◀ Trước")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page === 0),
                new ButtonBuilder()
                    .setCustomId("next")
                    .setLabel("Sau ▶")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled((page + 1) * pageSize >= txs.length)
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
