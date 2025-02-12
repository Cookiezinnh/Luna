const { EmbedBuilder } = require('discord.js');
const Luna = require('../../../../models/lunas'); // Modelo do MongoDB

module.exports = {
    name: 'profile',
    description: 'Veja as informações do seu perfil.',
    commandAlias: ['perfil'],
    async execute(message) {
        const userId = message.author.id;

        // Busca o perfil do usuário no banco de dados
        const user = await Luna.findOne({ userId });

        if (!user) {
            return message.reply('Você ainda não possui um perfil! Use o comando `start` para criar um.');
        }

        // Criação do embed com as informações do perfil
        const embed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle('Perfil')
            .setDescription(`Aqui estão as informações do seu perfil, ${user.username}:`)
            .addFields(
                { name: 'Tier', value: `${user.tier}`, inline: true },
                { name: 'Dinheiro', value: `${user.money} moedas`, inline: true },
                { name: 'Blocos Destruídos', value: `${user.blocksDestroyed}`, inline: true },
                { name: 'Conta Criada em', value: `${user.accountCreatedAt.toLocaleDateString()}`, inline: false }
            )
            .setFooter({ text: 'Use $inventory para ver seu inventário ou $craft para craftar itens!' });

        return message.reply({ embeds: [embed] });
    },
};