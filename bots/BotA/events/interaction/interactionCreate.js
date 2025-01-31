const emojis = require('../../../../shared/emojis');
const RoleConfig = require('../../models/roleConfig'); // Ajuste o caminho se necessário

module.exports = async (client, interaction) => {
    try {
        if (!interaction.isCommand()) return;

        const command = client.commands.get(interaction.commandName);

        // Caso o comando não seja encontrado
        if (!command) {
            await interaction.reply({
                content: `${emojis.x} Comando não encontrado!`,
                ephemeral: true,
            });
            return;
        }

        const memberRoles = interaction.member?.roles?.cache;
        const requiredRoles = command.requiredRoles || [];
        
        // Obtém os IDs dos cargos a partir do MongoDB
        const requiredRoleIds = await RoleConfig.find({
            roleName: { $in: requiredRoles },
            guildId: interaction.guild.id,
        }).then(roles => roles.map(role => role.roleId));
        
        // Caso o usuário não tenha permissão
        if (requiredRoleIds.length > 0 && (!memberRoles || !requiredRoleIds.some(roleId => memberRoles.has(roleId)))) {
            await interaction.reply({
                content: `${emojis.x} Você não tem permissão para usar este comando.`,
                ephemeral: true,
            });
            return;
        }        

        // Execução do comando
        if (!interaction.deferred && !interaction.replied) {
            await command.execute(interaction, client);
        } else {
            console.warn(`[InteractionUpdate] A interação já foi respondida: ${interaction.commandName}`);
        }
    } catch (error) {
        console.error(`[InteractionUpdate] Erro ao executar o comando: ${interaction.commandName}`, error);

        if (!interaction.deferred && !interaction.replied) {
            await interaction.reply({
                content: `${emojis.x} Ocorreu um erro ao executar este comando.`,
                ephemeral: true,
            }).catch(() => null);
        }
    }
};