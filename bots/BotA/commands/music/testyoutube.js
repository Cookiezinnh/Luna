const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// -------- x ---- - x - ---- x -------- \\
// Comando Atualizado para a nova update:
// -------- x ---- - x - ---- x -------- //

module.exports = {
    data: new SlashCommandBuilder()
        .setName('testyoutube')
        .setDescription('Testa a reprodução de uma música específica do YouTube.'),
    requiredRoles: ['ADMIN', 'MODERATOR'], // Restrições de Cargo
    supportsPrefix: true, // Habilita suporte a prefixo

    async execute(interaction) {
        const { client, member } = interaction;
        const distube = client.distube;

        if (!distube) {
            return interaction.reply({
                content: 'O sistema de música não está configurado corretamente.',
                ephemeral: true,
            });
        }

        const voiceChannel = member.voice.channel;
        if (!voiceChannel) {
            return interaction.reply({
                content: 'Você precisa estar em um canal de voz para usar este comando!',
                ephemeral: true,
            });
        }

        if (!voiceChannel.joinable) {
            return interaction.reply({
                content: 'Eu não consigo entrar no canal de voz. Verifique minhas permissões!',
                ephemeral: true,
            });
        }

        const youtubeUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'; // Substitua por outro link, se necessário.

        try {
            await interaction.deferReply();
            const options = { member, textChannel: interaction.channel };
            await distube.play(voiceChannel, youtubeUrl, options);

            await interaction.editReply({
                content: `🎶 Teste de YouTube: Música adicionada à fila ou tocando agora: ${youtubeUrl}`,
            });
        } catch (error) {
            console.error('Erro ao processar link do YouTube:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Erro ao Testar YouTube')
                .setDescription(`**Motivo:** ${error.message || 'Erro desconhecido.'}`);

            interaction.editReply({ embeds: [errorEmbed] });
        }
    },
};