const { v4: uuidv4 } = require('uuid'); // Para gerar UUIDs
const { minerals } = require('../../data/minerals');
const { resources } = require('../../data/resources');
const Luna = require('../../../../models/lunas');

module.exports = {
    name: 'craft',
    description: 'Craftar itens, como picaretas.',
    commandAlias: ['craftar', 'create'],
    async execute(message, args) {
        const userId = message.author.id;

        // Busca o perfil do usuário no banco de dados
        const user = await Luna.findOne({ userId });

        if (!user) {
            return message.reply('Você ainda não possui um perfil! Use o comando `start` para criar um.');
        }

        // Caso o jogador não forneça argumentos
        if (!args[0]) {
            return message.reply(
                'Para craftar uma picareta, utilize o comando:\n' +
                '`$craft pickaxe <id_do_minerio> <id_do_cabo> <id_da_peça> <id_da_corda>`\n\n' +
                '**Requisitos para uma picareta:**\n' +
                '- **1 Mineral:** Obtenha com o comando de mineração.\n' +
                '- **1 Cabo:** Item de recurso no seu inventário.\n' +
                '- **1 Peça:** Item de recurso no seu inventário.\n' +
                '- **1 Corda:** Item de recurso no seu inventário.'
            );
        }

        // Verifica se o subcomando é "pickaxe"
        if (args[0] !== 'pickaxe') {
            return message.reply('Formato do comando inválido. Use `$craft pickaxe <id_do_minerio> <id_do_cabo> <id_da_peça> <id_da_corda>`.');
        }

        const [idMineral, idCabo, idPeca, idCorda] = args.slice(1).map(Number);

        // Valida se os IDs fornecidos são válidos
        const mineral = minerals.find((m) => m.id === idMineral);
        const cabo = resources.find((r) => r.id === idCabo && r.name.includes('Cabo'));
        const peca = resources.find((r) => r.id === idPeca && r.name.includes('Peça'));
        const corda = resources.find((r) => r.id === idCorda && r.name.includes('Corda'));

        if (!mineral || !cabo || !peca || !corda) {
            return message.reply('Um ou mais IDs fornecidos são inválidos.');
        }

        // Verifica se o jogador possui os itens necessários no inventário
        const hasMineral = user.inventory_minerals.find((i) => i.id === idMineral && i.quantity > 0);
        const hasCabo = user.inventory_resources.find((i) => i.id === idCabo && i.quantity > 0);
        const hasPeca = user.inventory_resources.find((i) => i.id === idPeca && i.quantity > 0);
        const hasCorda = user.inventory_resources.find((i) => i.id === idCorda && i.quantity > 0);

        if (!hasMineral || !hasCabo || !hasPeca || !hasCorda) {
            return message.reply('Você não possui os materiais necessários para craftar essa picareta.');
        }

        // Remove os itens do inventário
        hasMineral.quantity--;
        hasCabo.quantity--;
        hasPeca.quantity--;
        hasCorda.quantity--;

        // Calcula os buffs da picareta
        const quantityBuff = mineral.QuantityBuff || 1; // Valor do mineral
        const hasteBuff = (cabo.hastebuff || 0) + (peca.hastebuff || 0) + (corda.hastebuff || 0); // Soma dos buffs de haste
        const blockBuff = (cabo.blockbuff || 0) + (peca.blockbuff || 0) + (corda.blockbuff || 0); // Soma dos buffs de block

        // Cria a picareta
        const newPickaxe = {
            uuid: uuidv4(), // Gera um UUID único para a picareta
            id: Date.now(), // ID único baseado no timestamp
            name: `Picareta de ${mineral.name}`,
            quantitybuff: quantityBuff,
            hastebuff: hasteBuff,
            blockbuff: blockBuff,
        };

        user.inventory_pickaxes.push(newPickaxe);

        // Salva no banco de dados
        await user.save();

        return message.reply(
            `Você craftou uma nova picareta: **${newPickaxe.name}**!\n` +
            `**Buffs:**\n` +
            `- Quantidade: ${newPickaxe.quantitybuff}\n` +
            `- Velocidade: ${newPickaxe.hastebuff}\n` +
            `- Resistência: ${newPickaxe.blockbuff}\n\n` +
            `UUID: **${newPickaxe.uuid}**`
        );
    },
};
