const { SlashCommandBuilder } = require('discord.js');
const MinecraftServer = require('../../models/MinecraftServer'); // Modelo MongoDB para servidores de Minecraft

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mc_serverstatus')
        .setDescription('Gerencia as mensagens de status do servidor de Minecraft.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Adiciona uma mensagem de status do servidor de Minecraft.')
                .addStringOption(option =>
                    option.setName('message_id')
                        .setDescription('O ID da mensagem que será atualizada.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('server_ip')
                        .setDescription('O IP do servidor de Minecraft.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove uma mensagem de status do servidor de Minecraft.')
                .addStringOption(option =>
                    option.setName('message_id')
                        .setDescription('O ID da mensagem que será removida.')
                        .setRequired(true))),
    requiredRoles: [], // Permitir sem restrições adicionais
    supportsPrefix: true, // Agora suporta comandos via prefixo

    async execute(context, args) {
        const isInteraction = context.isCommand?.();
        const guild = isInteraction ? context.guild : context.guild;
        const channel = isInteraction ? context.channel : context.channel;
        const executor = isInteraction ? context.user : context.author;

        const subcommand = isInteraction ? context.options.getSubcommand() : args[0];
        const messageId = isInteraction ? context.options.getString('message_id') : args[1];
        const serverIp = isInteraction ? context.options.getString('server_ip') : args[2];

        if (subcommand === 'add') {
            if (!messageId || !serverIp) {
                const errorMessage = 'Uso correto: `!mc_serverstatus add <message_id> <server_ip>`';
                return isInteraction
                    ? context.reply({ content: errorMessage, ephemeral: true })
                    : context.channel.send(errorMessage);
            }

            // Verifica se a mensagem existe e é um embed enviado pelo bot
            const message = await channel.messages.fetch(messageId).catch(() => null);
            if (!message || !message.embeds.length || message.author.id !== context.client.user.id) {
                const errorMessage = 'A mensagem deve ser um embed enviado por este bot.';
                return isInteraction
                    ? context.reply({ content: errorMessage, ephemeral: true })
                    : context.channel.send(errorMessage);
            }

            // Salva no banco de dados
            await MinecraftServer.create({
                messageId,
                serverIp,
                guildId: guild.id,
                channelId: channel.id
            });

            const successMessage = 'Mensagem de status do servidor adicionada com sucesso!';
            return isInteraction
                ? context.reply({ content: successMessage, ephemeral: true })
                : context.channel.send(successMessage);
        } else if (subcommand === 'remove') {
            if (!messageId) {
                const errorMessage = 'Uso correto: `!mc_serverstatus remove <message_id>`';
                return isInteraction
                    ? context.reply({ content: errorMessage, ephemeral: true })
                    : context.channel.send(errorMessage);
            }

            const deleted = await MinecraftServer.findOneAndDelete({ messageId, guildId: guild.id });

            if (!deleted) {
                const errorMessage = 'Mensagem de status do servidor não encontrada.';
                return isInteraction
                    ? context.reply({ content: errorMessage, ephemeral: true })
                    : context.channel.send(errorMessage);
            }

            const successMessage = 'Mensagem de status do servidor removida com sucesso!';
            return isInteraction
                ? context.reply({ content: successMessage, ephemeral: true })
                : context.channel.send(successMessage);
        } else {
            const errorMessage = 'Subcomando inválido. Use `add` ou `remove`.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }
    },
};