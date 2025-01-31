const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// -------- x ---- - x - ---- x -------- \\
// Comando Atualizado para a nova update:
// -------- x ---- - x - ---- x -------- //

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Ativa ou desativa o loop da música atual.'),
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

            const loopMode = queue.repeatMode === 0 ? 1 : 0; // 0 = desativado, 1 = loop da música
            queue.setRepeatMode(loopMode);

            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0x00ff00)
                        .setDescription(
                            loopMode
                                ? '🔁 Loop ativado para a música atual.'
                                : '🔁 Loop desativado.'
                        ),
                ],
            });
        } catch (error) {
            console.error('Erro ao alternar o loop:', error);
            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('❌ Não foi possível alterar o estado do loop.'),
                ],
            });
        }
    },
};