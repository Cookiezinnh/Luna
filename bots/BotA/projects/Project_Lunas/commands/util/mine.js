const { EmbedBuilder, Collection } = require('discord.js');
const Luna = require('../../../../models/lunas'); // Modelo do MongoDB
const { mines } = require('../../data/mines'); // Minas disponíveis
const { minerals } = require('../../data/minerals'); // Minerais disponíveis

// Armazena cooldowns para usuários
const cooldowns = new Collection();

module.exports = {
    name: 'mine',
    description: 'Minere recursos da mina correspondente ao seu tier atual.',
    commandAlias: ['minerar', 'break', 'destroy'],
    async execute(message) {
        const userId = message.author.id;

        // Verifica o cooldown do usuário
        const now = Date.now();
        const baseCooldown = 6000; // Cooldown base: 6 segundos
        if (cooldowns.has(userId)) {
            const expirationTime = cooldowns.get(userId);
            if (now < expirationTime) {
                const timeLeft = ((expirationTime - now) / 1000).toFixed(1);
                return message.reply(`Espere mais **${timeLeft} segundos** antes de minerar novamente.`);
            }
        }

        // Busca o perfil do usuário no banco de dados
        const user = await Luna.findOne({ userId });

        if (!user) {
            return message.reply('Você ainda não possui um perfil! Use o comando `start` para criar um.');
        }

        const userTier = user.tier; // Tier atual do usuário
        const currentMine = mines.find(mine => mine.tier === userTier); // Mina correspondente ao tier

        if (!currentMine) {
            return message.reply('Não foi encontrada uma mina para o seu tier atual.');
        }

        // Verifica se o usuário tem uma picareta equipada
        if (!user.equipped_pickaxe) {
            return message.reply('Você não tem nenhuma picareta equipada! Use o comando `equip` para equipar uma.');
        }

        // Obtém os buffs da picareta equipada com valores padrão
        const equippedPickaxe = user.equipped_pickaxe || {};
        const blockbuff = equippedPickaxe.blockbuff || 1; // Define o número máximo de blocos a serem minerados
        const quantitybuff = equippedPickaxe.quantitybuff || 1; // Buff de quantidade de minerais

        // Define o número de blocos a serem minerados (1 a BlockBuff)
        const blocksToMine = Math.floor(Math.random() * blockbuff) + 1;

        const minedItems = [];

        // Processa a mineração de cada bloco
        for (let i = 0; i < blocksToMine; i++) {
            // Determina o número de minerais a serem minerados no bloco
            const minMinerals = 1 * blockbuff;
            const maxMinerals = quantitybuff * blockbuff;
            const mineralsToMine = Math.floor(Math.random() * (maxMinerals - minMinerals + 1)) + minMinerals;

            // Seleciona minerais aleatórios da lootpool
            for (let j = 0; j < mineralsToMine; j++) {
                const roll = Math.random() * 100; // Gera um número aleatório entre 0 e 100
                const selectedMineral = minerals.find(mineral => currentMine.lootpool.includes(mineral.id) && roll <= mineral.chance);

                if (selectedMineral) {
                    minedItems.push({ id: selectedMineral.id, name: selectedMineral.name });
                }
            }
        }

        // Agrupa os minerais iguais
        const groupedItems = minedItems.reduce((acc, item) => {
            const existingItem = acc.find(i => i.id === item.id);
            if (existingItem) {
                existingItem.quantity++;
            } else {
                acc.push({ id: item.id, name: item.name, quantity: 1 });
            }
            return acc;
        }, []);

        // Atualiza o inventário de minerais do usuário
        groupedItems.forEach(item => {
            const existingItem = user.inventory_minerals.find(invItem => invItem.id === item.id);
            if (existingItem) {
                existingItem.quantity += item.quantity;
            } else {
                user.inventory_minerals.push({ id: item.id, name: item.name, quantity: item.quantity });
            }
        });

        user.blocksDestroyed += blocksToMine; // Atualiza o total de blocos destruídos
        await user.save(); // Salva as alterações no banco de dados

        // Envia o resultado da mineração
        if (groupedItems.length === 0) {
            return message.reply('Você não encontrou nenhum item desta vez. Tente melhorar sua picareta para obter mais resultados!');
        }

        const minedItemsList = groupedItems
            .map(item => `**${item.name}** x${item.quantity} (ID: ${item.id})`)
            .join('\n');
        const embed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle('Mineração Concluída!')
            .setDescription(
                `Você minerou **${blocksToMine} bloco(s)** e encontrou os seguintes itens:\n\n${minedItemsList}`
            )
            .setFooter({ text: 'Use o comando `inventory` para ver todos os seus itens.' });

        return message.reply({ embeds: [embed] });
    },
};