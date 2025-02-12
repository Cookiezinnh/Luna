const Luna = require('../../../../models/lunas'); // Modelo do MongoDB

module.exports = {
    name: 'equip',
    description: 'Equipe uma picareta para usar na mineração.',
    commandAlias: ['equipar', 'usar'],
    async execute(message, args) {
        const userId = message.author.id;

        // Busca o perfil do usuário no banco de dados
        const user = await Luna.findOne({ userId });

        if (!user) {
            return message.reply('Você ainda não possui um perfil! Use o comando `start` para criar um.');
        }

        const pickaxeId = Number(args[0]);

        if (!pickaxeId) {
            return message.reply('Você precisa especificar o ID da picareta que deseja equipar. Use `$inventory pickaxes` para verificar seus IDs.');
        }

        const pickaxe = user.inventory_pickaxes.find((p) => p.id === pickaxeId);

        if (!pickaxe) {
            return message.reply('Picareta não encontrada. Verifique o ID e tente novamente.');
        }

        // Define a picareta equipada no perfil do usuário
        user.equipped_pickaxe = {
            uuid: pickaxe.uuid,
            id: pickaxe.id,
            name: pickaxe.name,
            quantitybuff: pickaxe.quantitybuff,
            hastebuff: pickaxe.hastebuff,
            blockbuff: pickaxe.blockbuff,
        };

        await user.save();

        return message.reply(`Você equipou a picareta: **${pickaxe.name}**!`);
    },
};