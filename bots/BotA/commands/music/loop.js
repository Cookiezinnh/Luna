const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Ativa ou desativa o loop da música atual.'),
    requiredRoles: [], // Restrições de Cargo
    supportsPrefix: true, // Habilita suporte a prefixo

    async execute(interaction, args) {
        const distube = interaction?.client.distube || args.client.distube;
        const voiceChannel = interaction?.member?.voice.channel || args.member?.voice.channel;

        if (!voiceChannel) {
            const reply = {
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xED4245) // Vermelho
                        .setDescription('# ❌ Erro\n\nVocê precisa estar em um canal de voz para usar este comando.'),
                ],
                ephemeral: true,
            };

            return interaction ? interaction.reply(reply) : args.message.reply(reply);
        }

        try {
            const queue = distube.getQueue(interaction?.guildId || args.guildId);
            if (!queue) {
                const reply = {
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0xED4245) // Vermelho
                            .setDescription('# ❌ Erro\n\nNão há nada tocando no momento.'),
                    ],
                };

                return interaction ? interaction.reply(reply) : args.message.reply(reply);
            }

            const loopMode = queue.repeatMode === 0 ? 1 : 0; // 0 = desativado, 1 = loop da música
            queue.setRepeatMode(loopMode);

            const reply = {
                embeds: [
                    new EmbedBuilder()
                        .setColor(0x57F287) // Verde
                        .setDescription(loopMode ? '# 🔁 Loop Ativado\n\nO loop foi ativado para a música atual.' : '# 🔁 Loop Desativado\n\nO loop foi desativado.'),
                ],
            };

            return interaction ? interaction.reply(reply) : args.message.reply(reply);
        } catch (error) {
            console.error('Erro ao alternar o loop:', error);
            const reply = {
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xED4245) // Vermelho
                        .setDescription('# ❌ Erro\n\nNão foi possível alterar o estado do loop.'),
                ],
            };

            return interaction ? interaction.reply(reply) : args.message.reply(reply);
        }
    },
};