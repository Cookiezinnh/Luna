const { SlashCommandBuilder } = require('discord.js');
const rolecolorConfig = require('../../models/rolecolorConfig.js'); // Modelo MongoDB

module.exports = {
    data: new SlashCommandBuilder()
        .setName('config_colors')
        .setDescription('Gerencia a lista de cores disponíveis no servidor.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Adiciona uma cor ao banco de dados.')
                .addRoleOption(option =>
                    option.setName('cargo')
                        .setDescription('O cargo que representará a cor.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('nome')
                        .setDescription('O nome personalizado da cor.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove uma cor do banco de dados.')
                .addRoleOption(option =>
                    option.setName('cargo')
                        .setDescription('O cargo a ser removido.')
                        .setRequired(true))),
    requiredRoles: [], // Sem restrição de cargo
    supportsPrefix: true,

    async execute(context, args) {
        const isInteraction = context.isCommand?.();
        const guild = isInteraction ? context.guild : context.guild;
        const ownerId = guild.ownerId;
        const executorId = isInteraction ? context.user.id : context.author.id;

        if (executorId !== ownerId) {
            const errorMessage = ':x: Apenas o dono do servidor pode usar este comando.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }

        const subcommand = isInteraction ? context.options.getSubcommand() : args[0];
        const role = isInteraction ? context.options.getRole('cargo') : context.guild.roles.cache.get(args[1]);
        const customName = isInteraction ? context.options.getString('nome') : args.slice(2).join(' ');

        if (!role) {
            const errorMessage = ':x: Cargo não encontrado.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }

        if (subcommand === 'add') {
            // Verifica se o roleId já existe
            const existingColor = await rolecolorConfig.findOne({ guildId: guild.id, roleId: role.id });

            if (existingColor) {
                const errorMessage = ':x: Este cargo já está registrado como uma cor.';
                return isInteraction
                    ? context.reply({ content: errorMessage, ephemeral: true })
                    : context.channel.send(errorMessage);
            }

            const existingColors = await rolecolorConfig.find({ guildId: guild.id });

            if (existingColors.length >= 25) {
                const errorMessage = ':x: O limite de 25 cores foi atingido.';
                return isInteraction
                    ? context.reply({ content: errorMessage, ephemeral: true })
                    : context.channel.send(errorMessage);
            }

            // Gera um colorName único
            const colorName = `COLOR${existingColors.length + 1}`;

            // Cria a nova entrada no banco de dados
            await rolecolorConfig.create({ 
                guildId: guild.id, 
                roleId: role.id, 
                colorName, 
                customName 
            });

            const successMessage = `✅ A cor **${customName}** (${colorName}) foi adicionada com sucesso ao cargo <@&${role.id}>.`;
            return isInteraction
                ? context.reply({ content: successMessage, ephemeral: false })
                : context.channel.send(successMessage);
        } else if (subcommand === 'remove') {
            const deleted = await rolecolorConfig.findOneAndDelete({ guildId: guild.id, roleId: role.id });

            if (!deleted) {
                const errorMessage = ':x: Essa cor não está registrada.';
                return isInteraction
                    ? context.reply({ content: errorMessage, ephemeral: true })
                    : context.channel.send(errorMessage);
            }

            const successMessage = `✅ A cor associada ao cargo <@&${role.id}> foi removida com sucesso.`;
            return isInteraction
                ? context.reply({ content: successMessage, ephemeral: false })
                : context.channel.send(successMessage);
        }
    },
};