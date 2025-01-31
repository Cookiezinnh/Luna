const { EmbedBuilder } = require('discord.js');
const Luna = require('../../../../models/lunas'); // Modelo do MongoDB

module.exports = {
    name: 'pickaxe',
    description: 'Veja a picareta equipada atualmente.',
    commandAlias: ['equipamento'],
    async execute(message) {
        const userId = message.author.id;

        // Busca o perfil do usuário no banco de dados
        const user = await Luna.findOne({ userId });

        if (!user) {
            return message.reply('Você ainda não possui um perfil! Use o comando `start` para criar um.');
        }

        // Verifica se o jogador tem uma picareta equipada
        if (!user.equipped_pickaxe || !user.equipped_pickaxe.id) {
            return message.reply('Você não tem uma picareta equipada no momento.');
        }

        // Pega a picareta equipada
        const equippedPickaxe = user.equipped_pickaxe;

        // Criação do embed com as informações da picareta equipada
        const embed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle('Picareta Equipada')
            .setDescription(`Aqui estão as informações da picareta equipada, ${user.username}:`)
            .addFields(
                { name: 'Nome', value: equippedPickaxe.name, inline: false },
                { name: 'HasteBuff', value: `${equippedPickaxe.hastebuff}`, inline: true },
                { name: 'Quantidade de Buff', value: `${equippedPickaxe.quantitybuff}`, inline: true },
                { name: 'BlockBuff', value: `${equippedPickaxe.blockbuff}`, inline: true }
            )
            .setFooter({ text: 'Use $equip <id_da_picareta> para trocar a picareta equipada!' });

        return message.reply({ embeds: [embed] });
    },
};