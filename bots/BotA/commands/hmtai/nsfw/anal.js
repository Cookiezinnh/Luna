const Hmtai = require('hmtai');
const hmtai = new Hmtai();

module.exports = {
    name: 'h-anal',
    description: `Does somebody like being in all holes?~`,
    requiredRoles: [], // Restrições de Cargo
    StaffLocked: true,
    async execute(message, args) {
        // Verifica se o canal é NSFW
        if (!message.channel.nsfw) {
            return message.reply('❌ Este comando só pode ser usado em canais NSFW!');
        }

        try {
            // Obtem uma imagem usando a classe Hmtai
            const image = await hmtai.nsfw.anal();
            await message.channel.send(image);
        } catch (error) {
            console.error('Erro ao obter imagem do hmtai:', error);
            await message.reply('❌ Ocorreu um erro ao buscar a imagem. Tente novamente mais tarde.');
        }
        
    },
};