const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const PrivateVC = require('../../models/privateVoiceChannel.js');
const Categories = require('../../../shared/categories.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('createprivatevc')
        .setDescription('Cria um canal de voz privado.')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Nome do canal de voz.')
                .setRequired(true)
        ),
    commandAlias: ['createpvc', 'crpvc'],
    requiredRoles: [],
    supportsPrefix: true,

    async execute(context, args) {
        const isInteraction = context.isCommand?.();
        const guild = context.guild;
        const member = isInteraction ? context.member : context.member || context.author;
        const inputName = isInteraction ? context.options.getString('name') : args.join(' ');

        if (!member || !guild) {
            const errorMessage = '❌ Não foi possível identificar o usuário ou servidor.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }

        const channelName = `┗・🔊︰${member.user.username}'s (${inputName.slice(0, 20).replace(/[^a-zA-Z0-9 ]/g, '')})`;
        const categoryId = Categories.PRIVATE_VC_CATEGORY;

        const existingVC = await PrivateVC.findOne({ ownerId: member.id });
        if (existingVC) {
            const reply = '⚠️ Você já possui um canal privado ativo.';
            return isInteraction
                ? context.reply({ content: reply, ephemeral: true })
                : context.channel.send(reply);
        }

        try {
            const channel = await guild.channels.create({
                name: channelName,
                type: 2,
                parent: categoryId,
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone.id,
                        deny: [PermissionFlagsBits.ViewChannel],
                    },
                    {
                        id: member.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.Connect,
                            PermissionFlagsBits.Speak,
                            PermissionFlagsBits.ManageChannels,
                            PermissionFlagsBits.ManageRoles,
                        ],
                    },
                ],
            });

            await PrivateVC.create({
                ownerId: member.id,
                voiceChannelId: channel.id,
                guildId: guild.id,
                name: channelName,
            });

            const successMessage = `✅ Canal de voz privado **${channelName}** criado com sucesso!`;
            return isInteraction
                ? context.reply({ content: successMessage, ephemeral: true })
                : context.channel.send(successMessage);
        } catch (error) {
            console.error('[CreatePrivateVC] Erro ao criar canal:', error);
            const errorMessage = '❌ Ocorreu um erro ao criar seu canal privado.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }
    },
};