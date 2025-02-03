const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Para a música e limpa toda a fila.'),
    requiredRoles: ['ADMIN', 'MODERATOR'], // Restrições de Cargo
    supportsPrefix: true, // Habilita suporte a prefixo

    async execute(interaction) {
        const distube = interaction.client.distube;

        try {
            const queue = distube.getQueue(interaction.guildId);
            if (!queue) {
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0xff0000)
                            .setDescription('❌ Não há nada tocando no momento.'),
                    ],
                });
            }

            queue.stop(); // Para a música e limpa a fila
            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0x00ff00)
                        .setDescription('⏹️ A reprodução foi parada e a fila foi limpa.'),
                ],
            });

            console.log('🟨 | [Music] Comando stop executado. A fila foi limpa.');
        } catch (error) {
            console.error('Erro ao parar a música:', error);
            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('❌ Não foi possível parar a música.'),
                ],
            });
        }
    },
};