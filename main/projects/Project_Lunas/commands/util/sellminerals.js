const { EmbedBuilder } = require('discord.js');
const Luna = require('../../../../models/lunas'); // Modelo do MongoDB
const { minerals } = require('../../data/minerals'); // Dados dos minerais disponíveis

module.exports = {
    name: 'sellminerals',
    description: 'Venda minerais do seu inventário.',
    commandAlias: ['sell'],
    async execute(message, args) {
        const userId = message.author.id;

        // Busca o perfil do usuário no banco de dados
        const user = await Luna.findOne({ userId });

        if (!user) {
            return message.reply('Você ainda não possui um perfil! Use o comando `start` para criar um.');
        }

        if (user.inventory_minerals.length === 0) {
            return message.reply('Seu inventário de minerais está vazio.');
        }

        const itemIdOrAll = args[0];
        const quantity = args[1] ? args[1].toLowerCase() : null;

        let totalEarned = 0; // Total de dinheiro ganho
        let itemsSold = []; // Itens vendidos

        if (itemIdOrAll === 'all') {
            // Venda de todos os minerais
            user.inventory_minerals.forEach(item => {
                const mineral = minerals.find(m => m.id === item.id);
                if (mineral) {
                    totalEarned += item.quantity * mineral.sellPrice;
                    itemsSold.push({ name: mineral.name, quantity: item.quantity });
                }
            });
            user.inventory_minerals = []; // Limpa o inventário de minerais
        } else {
            // Venda de um item específico
            const itemId = parseInt(itemIdOrAll);
            const mineral = minerals.find(m => m.id === itemId);

            if (!mineral) {
                return message.reply('O ID do minério especificado não existe.');
            }

            const itemInInventory = user.inventory_minerals.find(item => item.id === itemId);

            if (!itemInInventory) {
                return message.reply('Você não possui esse minério em seu inventário.');
            }

            const quantityToSell = quantity === 'all' ? itemInInventory.quantity : parseInt(quantity);

            if (isNaN(quantityToSell) || quantityToSell <= 0 || quantityToSell > itemInInventory.quantity) {
                return message.reply('Quantidade inválida. Certifique-se de especificar um número válido ou "all".');
            }

            // Calcula o valor e remove do inventário
            totalEarned += quantityToSell * mineral.sellPrice;
            itemInInventory.quantity -= quantityToSell;

            itemsSold.push({ name: mineral.name, quantity: quantityToSell });

            // Remove o item do inventário se a quantidade for zero
            if (itemInInventory.quantity === 0) {
                user.inventory_minerals = user.inventory_minerals.filter(item => item.id !== itemId);
            }
        }

        // Atualiza o dinheiro do usuário e salva
        user.money += totalEarned;
        await user.save();

        // Resposta com o resultado da venda
        const soldItemsList = itemsSold
            .map(item => `**${item.name}** - Quantidade Vendida: ${item.quantity}`)
            .join('\n');
        const embed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle('Venda de Minerais')
            .setDescription(
                `Você vendeu os seguintes minerais:\n\n${soldItemsList}\n\n` +
                `💰 Total ganho: **${totalEarned.toFixed(2)} moedas**`
            )
            .setFooter({ text: 'Continue minerando para ganhar mais dinheiro!' });

        return message.reply({ embeds: [embed] });
    },
};