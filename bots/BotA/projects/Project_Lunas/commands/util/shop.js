const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Luna = require('../../../../models/lunas'); // Modelo do MongoDB
const { resources } = require('../../data/resources'); // Dados dos recursos disponíveis

module.exports = {
    name: 'shop',
    description: 'Visualize e compre recursos disponíveis para o seu nível de tier.',
    commandAlias: ['loja'],
    async execute(message) {
        const userId = message.author.id;

        // Busca o perfil do usuário no banco de dados
        const user = await Luna.findOne({ userId });

        if (!user) {
            return message.reply('Você ainda não está registrado no sistema. Use o comando `start` para criar seu perfil.');
        }

        const userTier = user.tier || 1; // Tier atual do usuário, padrão 1 se não definido
        let currentPage = 1; // Página inicial começa no Tier 1

        // Função para criar o embed de acordo com o tier
        const createEmbed = (tier) => {
            const filteredResources = resources.filter((item) => item.tier <= tier); // Filtra itens pelo tier

            if (filteredResources.length === 0) {
                return new EmbedBuilder()
                    .setColor(0xff0000)
                    .setTitle('Nenhum Recurso Disponível')
                    .setDescription(`Não há recursos disponíveis para o Tier ${tier}.`);
            }

            const resourceTable = filteredResources
                .map((item) => `\`${item.id}\` - **${item.name}** | 💰 Preço: ${item.price} moedas`)
                .join('\n');

            return new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle(`Recursos Disponíveis para o Tier ${tier}`)
                .setDescription(`**ID | Nome | Preço**\n${resourceTable}`)
                .setFooter({ text: 'Use o comando `$buy <ID> <quantidade>` para comprar um item!' });
        };

        // Função para criar os botões de navegação
        const createButtons = (page) => {
            return new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('previous')
                    .setLabel('◀ Anterior')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page <= 1), // Desativa o botão "Anterior" na primeira página
                new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('Próximo ▶')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page >= userTier) // Desativa o botão "Próximo" após o último tier do usuário
            );
        };

        // Envia o embed inicial com os itens do Tier 1
        const embed = createEmbed(currentPage);
        const buttons = createButtons(currentPage);

        const sentMessage = await message.reply({ embeds: [embed], components: [buttons] });

        // Cria um coletor para interações com os botões
        const filter = (interaction) => interaction.user.id === message.author.id;
        const collector = sentMessage.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async (interaction) => {
            if (interaction.customId === 'previous') currentPage--;
            if (interaction.customId === 'next') currentPage++;

            const updatedEmbed = createEmbed(currentPage);
            const updatedButtons = createButtons(currentPage);

            await interaction.update({ embeds: [updatedEmbed], components: [updatedButtons] });
        });

        collector.on('end', () => {
            const disabledButtons = createButtons(currentPage).components.map((btn) => btn.setDisabled(true));
            sentMessage.edit({ components: [new ActionRowBuilder().addComponents(disabledButtons)] });
        });
    },
};