const Hmtai = require('hmtai');
const hmtai = new Hmtai();

module.exports = {
    name: 'tea',
    commandAlias: ['anime-tea', 'ilovetea'],
    description: 'I want some tea! ☕',
    requiredRoles: [], // Cargos permitidos para usar este comando
    async execute(message, args) {
        try {
            const image = await hmtai.sfw.tea();
            await message.channel.send(image);
        } catch (error) {
            console.error('Erro ao obter imagem do hmtai:', error);
            await message.reply('❌ Ocorreu um erro ao buscar a imagem. Tente novamente mais tarde.');
        }
    },
};