const BotStaffList = require('../../models/botStaffList'); // Modelo da lista de staff

module.exports = {
    name: 'addtostaff',
    description: 'Adiciona um usuário à lista de staff.',
    commandAlias: ['snowyiestaffadd', 'sny_staffadd', 'sny_stfadd'], // Aliases para o comando
    requiredRoles: [], // Sem restrição de cargo
    StaffLocked: true, // Restrito para staff

    async execute(message, args) {
        // Verifica se o usuário que executou o comando está autorizado
        const isStaff = await BotStaffList.exists({ userId: message.author.id });
        if (!isStaff) {
            return message.reply(':x: Você não tem permissão para usar este comando.');
        }

        // Verifica se o comando foi usado com um usuário
        const user = message.mentions.users.first() || await message.client.users.fetch(args[0]).catch(() => null);
        if (!user) {
            return message.reply(':x: Você deve mencionar um usuário ou fornecer um ID válido.');
        }

        // Verifica se o usuário já está na lista de staff
        const alreadyInStaff = await BotStaffList.exists({ userId: user.id });
        if (alreadyInStaff) {
            return message.reply(`:x: O usuário ${user.tag} já está na lista de staff.`);
        }

        // Adiciona o usuário à lista de staff
        try {
            const newStaff = new BotStaffList({
                userId: user.id,
            });

            await newStaff.save();

            return message.reply(`✅ O usuário ${user.tag} foi adicionado à lista de staff com sucesso!`);
        } catch (error) {
            console.error('Erro ao adicionar o usuário à lista de staff:', error);
            return message.reply(':x: Ocorreu um erro ao adicionar o usuário à lista de staff.');
        }
    },
};