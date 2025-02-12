const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pausa a música que está tocando.'),
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
                    ephemeral: true,
                };

                return interaction ? interaction.reply(reply) : args.message.reply(reply);
            }

            queue.pause();

            const reply = {
                embeds: [
                    new EmbedBuilder()
                        .setColor(0x57F287) // Verde
                        .setDescription('# ⏸️ Música Pausada\n\nA música foi pausada com sucesso.'),
                ],
            };

            return interaction ? interaction.reply(reply) : args.message.reply(reply);
        } catch (error) {
            console.error('Erro ao pausar música:', error);
            const reply = {
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xED4245) // Vermelho
                        .setDescription('# ❌ Erro\n\nNão foi possível pausar a música.'),
                ],
                ephemeral: true,
            };

            return interaction ? interaction.reply(reply) : args.message.reply(reply);
        }
    },
};