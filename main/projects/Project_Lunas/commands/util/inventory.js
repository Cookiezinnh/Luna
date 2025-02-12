const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Luna = require('../../../../models/lunas'); // Modelo do MongoDB

module.exports = {
    name: 'inventory',
    description: 'Veja o seu inventário.',
    commandAlias: ['inv', 'inventario'],
    async execute(message, args) {
        const userId = message.author.id;

        // Busca o perfil do usuário no banco de dados
        const user = await Luna.findOne({ userId });

        if (!user) {
            return message.reply('Você ainda não possui um perfil! Use o comando `start` para criar um.');
        }

        const subcommand = args[0];
        if (!subcommand || !['minerals', 'resources', 'pickaxes'].includes(subcommand)) {
            const infoEmbed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle('Inventário')
                .setDescription('Escolha qual parte do seu inventário deseja visualizar:')
                .addFields(
                    { name: 'Minerais', value: '`$inventory minerals`', inline: true },
                    { name: 'Recursos', value: '`$inventory resources`', inline: true },
                    { name: 'Picaretas', value: '`$inventory pickaxes`', inline: true }
                )
                .setFooter({ text: 'Use um dos subcomandos para ver o inventário desejado!' });

            return message.reply({ embeds: [infoEmbed] });
        }

        const ITEMS_PER_PAGE = 15;

        // Função para organizar por tier
        const sortByTier = (items) => items.sort((a, b) => a.tier - b.tier);

        // Função para criar embed
        const createEmbed = (items, page, title, footerText) => {
            const startIndex = (page - 1) * ITEMS_PER_PAGE;
            const endIndex = startIndex + ITEMS_PER_PAGE;
            const itemsPage = items.slice(startIndex, endIndex);

            const description = itemsPage.length > 0
                ? itemsPage.map(item => `**${item.name}** (ID: ${item.id}, Tier: ${item.tier}) - Quantidade: ${item.quantity}`).join('\n')
                : 'Nenhum item encontrado nesta página.';

            return new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle(title)
                .setDescription(description)
                .setFooter({ text: `${footerText} | Página ${page}/${Math.ceil(items.length / ITEMS_PER_PAGE)}` });
        };

        // Função para criar botões
        const createButtons = (page, totalPages) => {
            return new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('previous')
                    .setLabel('◀ Anterior')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page <= 1),
                new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('Próximo ▶')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page >= totalPages)
            );
        };

        const handleInventory = async (items, title) => {
            let currentPage = 1;
            items = sortByTier(items);
            const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);

            const embed = createEmbed(items, currentPage, title, `Total de páginas: ${totalPages}`);
            const buttons = createButtons(currentPage, totalPages);

            const sentMessage = await message.reply({ embeds: [embed], components: [buttons] });

            const filter = (interaction) => interaction.user.id === message.author.id;
            const collector = sentMessage.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async (interaction) => {
                if (interaction.customId === 'previous') currentPage--;
                if (interaction.customId === 'next') currentPage++;

                const updatedEmbed = createEmbed(items, currentPage, title, `Total de páginas: ${totalPages}`);
                const updatedButtons = createButtons(currentPage, totalPages);

                await interaction.update({ embeds: [updatedEmbed], components: [updatedButtons] });
            });

            collector.on('end', () => {
                const disabledButtons = createButtons(currentPage, totalPages).components.map((btn) => btn.setDisabled(true));
                sentMessage.edit({ components: [new ActionRowBuilder().addComponents(disabledButtons)] });
            });
        };

        // Processa os subcomandos
        if (subcommand === 'minerals') {
            const minerals = user.inventory_minerals || [];
            if (minerals.length === 0) return message.reply('Seu inventário de minerais está vazio.');
            await handleInventory(minerals, 'Inventário: Minerais');
        } else if (subcommand === 'resources') {
            const resources = user.inventory_resources || [];
            if (resources.length === 0) return message.reply('Seu inventário de recursos está vazio.');
            await handleInventory(resources, 'Inventário: Recursos');
        } else if (subcommand === 'pickaxes') {
            const pickaxes = user.inventory_pickaxes || [];

            const createPickaxesEmbed = (page) => {
                const startIndex = (page - 1) * ITEMS_PER_PAGE;
                const endIndex = startIndex + ITEMS_PER_PAGE;
                const itemsPage = pickaxes.slice(startIndex, endIndex);

                const description = itemsPage.length > 0
                    ? itemsPage.map(pickaxe => 
                        `**${pickaxe.name}** (ID: ${pickaxe.id})\n` +
                        `- UUID: ${pickaxe.uuid}\n` +
                        `- Quantidade: ${pickaxe.quantitybuff}\n` +
                        `- Velocidade: ${pickaxe.hastebuff}\n` +
                        `- Resistência: ${pickaxe.blockbuff}`
                    ).join('\n\n')
                    : 'Nenhuma picareta encontrada nesta página.';

                return new EmbedBuilder()
                    .setColor(0x00ff00)
                    .setTitle('Inventário: Picaretas')
                    .setDescription(description)
                    .setFooter({ text: `Página ${page}/${Math.ceil(pickaxes.length / ITEMS_PER_PAGE)}` });
            };

            await handleInventory(pickaxes, 'Inventário: Picaretas');
        }
    },
};