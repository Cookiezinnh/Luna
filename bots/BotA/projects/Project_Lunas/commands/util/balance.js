const { EmbedBuilder } = require('discord.js');
const Luna = require('../../../../models/lunas'); // Modelo do MongoDB

module.exports = {
    name: 'balance',
    description: 'Veja o quanto de dinheiro você possui.',
    commandAlias: ['bal'],
    async execute(message) {
        const userId = message.author.id;

        // Busca o perfil do usuário no banco de dados
        const user = await Luna.findOne({ userId });

        if (!user) {
            return message.reply('Você ainda não possui um perfil! Use o comando `start` para criar um.');
        }

        const balance = user.balance || 0; // Saldo do usuário, padrão 0 se não definido

        const embed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle('Seu Saldo')
            .setDescription(`💰 Você possui **${balance} moedas**.`)
            .setFooter({ text: 'Use o comando `shop` para gastar suas moedas!' });

        return message.reply({ embeds: [embed] });
    },
};