const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Mostra o avatar de um usuário.')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Usuário para ver o avatar.')
        ),
    commandAlias: ['useravatar','avataruser'],
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

        return context.reply({ content: `${usuario.username}'s Avatar: ${usuario.displayAvatarURL({ dynamic: true, size: 512 })}` });
    },
};