const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('banner')
        .setDescription('Mostra o banner de um usuário.')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Usuário para ver o banner.')
        ),
    commandAlias: ['userbanner','banneruser'],
    requiredRoles: [], // Nenhuma restrição de cargo
    supportsPrefix: true, // Habilita suporte a prefixo
    async execute(context, args) {
        const isInteraction = context.isCommand?.();
        let usuario;

        if (isInteraction) {
            usuario = context.options.getUser('usuario') || context.user;
        } else {
            usuario = args[0] ? context.guild.members.cache.get(args[0]?.replace(/\D/g, ''))?.user : context.author;
        }

        if (!usuario) {
            return context.reply({ content: '❌ Usuário não encontrado.', ephemeral: true });
        }

        const user = await context.client.users.fetch(usuario.id, { force: true });
        const bannerURL = user.bannerURL({ dynamic: true, size: 512 });

        return context.reply({ content: bannerURL ? `${usuario.username}'s Banner: ${bannerURL}` : '❌ Este usuário não tem um banner.' });
    },
};