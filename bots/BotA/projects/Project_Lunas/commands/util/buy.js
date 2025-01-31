const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Luna = require('../../../../models/lunas'); // Modelo do MongoDB
const { resources } = require('../../data/resources'); // Dados dos recursos disponíveis

module.exports = {
    name: 'buy',
    description: 'Compre recursos usando seu dinheiro.',
    commandAlias: ['comprar', 'buyitem'],
    async execute(message, args) {
        const userId = message.author.id;

        // Busca o perfil do usuário no banco de dados
        const user = await Luna.findOne({ userId });

        if (!user) {
            return message.reply('Você ainda não está registrado no sistema. Use o comando `start` para criar seu perfil.');
        }

        const resourceId = parseInt(args[0]);
        const quantity = args[1] ? (args[1].toLowerCase() === 'all' ? Infinity : parseInt(args[1])) : 1;

        if (isNaN(resourceId) || isNaN(quantity) || quantity <= 0) {
            return message.reply('Por favor, forneça um ID válido e uma quantidade válida para a compra.');
        }

        const resource = resources.find((item) => item.id === resourceId);

        if (!resource) {
            return message.reply('O ID do recurso especificado não existe.');
        }

        if (user.tier < resource.tier) {
            return message.reply('Você não tem o nível de tier necessário para comprar este recurso.');
        }

        const totalPrice = resource.price * Math.min(quantity, Math.floor(user.money / resource.price));

        if (user.money < totalPrice) {
            return message.reply('Você não tem dinheiro suficiente para comprar essa quantidade.');
        }

        // Adiciona o recurso ao inventário do usuário
        let inventoryItem = user.inventory_resources.find((item) => item.id === resourceId);
        if (inventoryItem) {
            inventoryItem.quantity += quantity;
        } else {
            user.inventory_resources.push({ id: resource.id, name: resource.name, quantity });
        }

        // Deduz o custo do dinheiro do usuário
        user.money -= totalPrice;

        await user.save();

        return message.reply(`Você comprou **${quantity}x ${resource.name}** por **${totalPrice} moedas**.`);
    },
};