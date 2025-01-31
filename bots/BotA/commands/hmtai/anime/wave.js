const Hmtai = require('hmtai');
const hmtai = new Hmtai();

module.exports = {
    name: 'wave',
    commandAlias: ['wave-gif', 'waveuser'],
    description: `Greeting! Wave gifs! (●'◡'●)`,
    requiredRoles: [], // Cargos permitidos para usar este comando
    async execute(message, args) {
        try {
            // Obtém uma imagem usando a classe Hmtai
            const image = await hmtai.sfw.wave();
            await message.channel.send(image);
        } catch (error) {
            console.error('Erro ao obter imagem do hmtai:', error);
            await message.reply('❌ Ocorreu um erro ao buscar a imagem. Tente novamente mais tarde.');
        }
    },
};