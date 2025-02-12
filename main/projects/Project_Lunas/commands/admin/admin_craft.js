const { v4: uuidv4 } = require('uuid'); // Para gerar UUIDs
const { minerals } = require('../../data/minerals');
const { resources } = require('../../data/resources');
const Luna = require('../../../../models/lunas');

module.exports = {
    name: 'admin_create',
    description: 'Cria picaretas diretamente no inventário de um usuário (admin-only).',
    commandAlias: ['create_item', 'admin_item'],
    async execute(message, args) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Apenas administradores podem usar este comando.');
        }

        if (args[0] !== 'pickaxe' || args.length < 5) {
            return message.reply(
                'Formato do comando inválido. Use:\n' +
                '`$admin_create pickaxe <id_da_gema> <id_do_cabo> <id_da_peça> <id_da_corda> [hastebuff] [blockbuff] [quantitybuff]`.'
            );
        }

        const [idMineral, idCabo, idPeca, idCorda, hasteBuffArg, blockBuffArg, quantityBuffArg] = args.slice(1);
        const mineral = minerals.find((m) => m.id === Number(idMineral));
        const cabo = resources.find((r) => r.id === Number(idCabo) && r.name.includes('Cabo'));
        const peca = resources.find((r) => r.id === Number(idPeca) && r.name.includes('Peça'));
        const corda = resources.find((r) => r.id === Number(idCorda) && r.name.includes('Corda'));

        if (!mineral || !cabo || !peca || !corda) {
            return message.reply('Um ou mais IDs fornecidos são inválidos.');
        }

        const calculatedHasteBuff = (cabo.hastebuff || 0) + (peca.hastebuff || 0) + (corda.hastebuff || 0);
        const calculatedBlockBuff = (cabo.blockbuff || 0) + (peca.blockbuff || 0) + (corda.blockbuff || 0);
        const calculatedQuantityBuff = mineral.QuantityBuff || 1;

        const hasteBuff = hasteBuffArg !== 'vnd' && hasteBuffArg !== undefined ? Number(hasteBuffArg) : calculatedHasteBuff;
        const blockBuff = blockBuffArg !== 'vnd' && blockBuffArg !== undefined ? Number(blockBuffArg) : calculatedBlockBuff;
        const quantityBuff = quantityBuffArg !== 'vnd' && quantityBuffArg !== undefined ? Number(quantityBuffArg) : calculatedQuantityBuff;

        const pickaxeUuid = uuidv4();
        const pickaxeName = `Picareta de ${mineral.name}`;
        const newPickaxe = {
            uuid: pickaxeUuid,
            id: Date.now(),
            name: pickaxeName,
            quantitybuff: quantityBuff,
            hastebuff: hasteBuff,
            blockbuff: blockBuff,
        };

        console.log('Nova picareta a ser salva:', newPickaxe); // Inspeciona a picareta

        if (!pickaxeUuid) {
            return message.reply('Houve um erro ao gerar o UUID da picareta.');
        }

        const userId = message.author.id;
        const user = await Luna.findOne({ userId });

        if (!user) {
            return message.reply('Não foi possível encontrar um perfil para você. Use o comando `start` para criar um.');
        }

        if (!user.inventory_pickaxes) {
            user.inventory_pickaxes = [];
        }

        user.inventory_pickaxes.push(newPickaxe);

        try {
            await user.save();
        } catch (error) {
            console.error('Erro ao salvar no banco de dados:', error);
            return message.reply('Houve um erro ao salvar a picareta no banco de dados.');
        }

        return message.reply(
            `Picareta criada com sucesso!\n\n` +
            `**Nome:** ${pickaxeName}\n` +
            `**Buffs:**\n` +
            `- Quantidade: ${quantityBuff}\n` +
            `- Velocidade: ${hasteBuff}\n` +
            `- Resistência: ${blockBuff}\n` +
            `UUID: ${pickaxeUuid}`
        );
    },
};