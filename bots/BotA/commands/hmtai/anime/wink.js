const Hmtai = require('hmtai');
const hmtai = new Hmtai();

module.exports = {
    name: 'wink',
    commandAlias: ['wink-gif', 'animewink'],
    description: 'Wink! 😉',
    requiredRoles: [], // Cargos permitidos para usar este comando
    async execute(message, args) {
        try {
            const image = await hmtai.sfw.wink();
            await message.channel.send(image);
        } catch (error) {
            console.error('Erro ao obter imagem do hmtai:', error);
            await message.reply('❌ Ocorreu um erro ao buscar a imagem. Tente novamente mais tarde.');
        }
    },
};