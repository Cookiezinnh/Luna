const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const rolecolorConfig = require('../../models/rolecolorConfig.js'); // Modelo MongoDB

module.exports = {
    data: new SlashCommandBuilder()
        .setName('escolher_cor')
        .setDescription('Escolha uma cor para seu nome no servidor.'),
    requiredRoles: [], // Sem restrição de cargo
    commandAlias: ['colorchoose', 'choosecolor', 'choose_color', 'color_choose', 'cor_escolher', 'escolhercor', 'corescolher'],
    supportsPrefix: true,

    async execute(context, args) {
        const isInteraction = context.isCommand?.();
        const guild = context.guild;
        const member = isInteraction ? context.member : context.member;

        // Busca as cores disponíveis no servidor
        const colors = await rolecolorConfig.find({ guildId: guild.id });

        if (colors.length === 0) {
            const errorMessage = ':x: Nenhuma cor está disponível no momento.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }

        // Cria a tabela de cores com menção ao cargo
        const colorTable = colors.map((color, index) => {
            return `**${index + 1}.** <@&${color.roleId}> ${color.customName}`;
        }).join('\n');

        const embed = new EmbedBuilder()
            .setTitle('🎨 Cores Disponíveis')
            .setDescription(`# Escolha uma cor para seu nome\n\n${colorTable}\n\nDigite o número da cor que deseja escolher. Você tem **30 segundos** para decidir.\n\nCaso queira cancelar, digite **"sair"**.`)
            .setColor(15548997) // Cor do embed (vermelho escuro)
            .setFooter({ text: 'Escolha uma cor para personalizar seu nome no servidor.' });

        // Envia a tabela de cores
        const message = await (isInteraction
            ? context.reply({ embeds: [embed], ephemeral: false })
            : context.channel.send({ embeds: [embed] }));

        // Filtro para coletar a resposta do usuário
        const filter = (response) => {
            return response.author.id === member.id && (!isNaN(response.content) || response.content.toLowerCase() === 'sair');
        };

        try {
            let selectedColor;
            let collected;

            // Loop para continuar escutando até que o usuário escolha uma cor válida, digite "sair" ou o tempo se esgote
            while (!selectedColor) {
                collected = await context.channel.awaitMessages({
                    filter,
                    max: 1,
                    time: 30000, // 30 segundos
                    errors: ['time'],
                });

                const userInput = collected.first().content;

                // Verifica se o usuário digitou "sair"
                if (userInput.toLowerCase() === 'sair') {
                    const cancelMessage = '❌ Interação cancelada.';
                    return isInteraction
                        ? context.reply({ content: cancelMessage, ephemeral: true })
                        : context.channel.send(cancelMessage);
                }

                const selectedNumber = parseInt(userInput);
                selectedColor = colors[selectedNumber - 1];

                if (!selectedColor) {
                    const errorMessage = ':x: Cor inválida. Por favor, escolha um número da lista.';
                    await context.channel.send(errorMessage);
                }
            }

            // Verifica se o usuário já está usando essa cor
            const userHasRole = member.roles.cache.has(selectedColor.roleId);
            if (userHasRole) {
                const errorMessage = `:x: Você já está usando a cor **${selectedColor.customName}**.`;
                return isInteraction
                    ? context.reply({ content: errorMessage, ephemeral: true })
                    : context.channel.send(errorMessage);
            }

            // Remove cargos de cor antigos
            const userColorRoles = member.roles.cache.filter(role => {
                return colors.some(color => color.roleId === role.id);
            });

            await member.roles.remove(userColorRoles);

            // Adiciona o novo cargo de cor
            await member.roles.add(selectedColor.roleId);

            const successMessage = `✅ Você escolheu a cor **${selectedColor.customName}**!`;
            return isInteraction
                ? context.reply({ content: successMessage, ephemeral: false })
                : context.channel.send(successMessage);
        } catch (error) {
            // Caso o tempo se esgote
            const timeoutMessage = '⏰ Tempo esgotado. Interação finalizada.';
            return isInteraction
                ? context.reply({ content: timeoutMessage, ephemeral: true })
                : context.channel.send(timeoutMessage);
        }
    },
};