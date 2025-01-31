const Hmtai = require('hmtai');
const hmtai = new Hmtai();

module.exports = {
    name: 'depression',
    commandAlias: ['depression-gif', 'animedepression'],
    description: 'Sends an animated gif about depression (SFW).',
    requiredRoles: [],
    async execute(message, args) {
        try {
            const image = await hmtai.sfw.depression();
            await message.channel.send(image);
        } catch (error) {
            console.error('Error fetching image from hmtai:', error);
            await message.reply('❌ An error occurred while fetching the image. Please try again later.');
        }
    },
};