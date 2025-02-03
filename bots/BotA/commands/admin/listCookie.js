const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const Cookie = require('../../models/musicCookie');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('list_cookie')
        .setDescription('Exibe o cookie atual que o bot está utilizando.'),
    commandAlias: ['cookielist', 'listcookie', 'cookie_list'],
    requiredRoles: ['ADMIN', 'MODERATOR'],
    supportsPrefix: true,
    StaffLocked: true,

    async execute(interaction) {
        try {
            // Busca o cookie mais recente no banco de dados
            const cookie = await Cookie.findOne().sort({ lastUpdated: -1 });

            // Verifica se o cookie existe
            if (!cookie || !cookie.cookieText) {
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#FF0000')
                            .setDescription('❌ Nenhum cookie encontrado no banco de dados.')
                    ],
                    ephemeral: true
                });
            }

            // Verifica se o cookie é muito grande para ser exibido no embed
            if (cookie.cookieText.length > 4096) {
                // Cria um arquivo .txt com o conteúdo do cookie
                const attachment = new AttachmentBuilder(Buffer.from(cookie.cookieText), { name: 'cookie.txt' });

                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#00FF00')
                            .setTitle('🍪 Cookie Atual')
                            .setDescription('O cookie é muito grande para ser exibido aqui. Confira o arquivo anexado.')
                            .setFooter({ text: `Última atualização: ${cookie.lastUpdated.toLocaleString()}` })
                    ],
                    files: [attachment],
                    ephemeral: true
                });
            }

            // Exibe o cookie no embed
            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('🍪 Cookie Atual')
                .setDescription(`\`\`\`${cookie.cookieText}\`\`\``)
                .setFooter({ text: `Última atualização: ${cookie.lastUpdated.toLocaleString()}` });

            interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            console.error('Erro ao exibir cookie:', error);
            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FF0000')
                        .setDescription(`❌ Erro ao exibir o cookie: ${error.message}`)
                ],
                ephemeral: true
            });
        }
    }
};