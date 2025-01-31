const Hmtai = require('hmtai');
const hmtai = new Hmtai();

module.exports = {
    name: 'hug',
    commandAlias: ['hug-gif', 'animehug'],
    description: 'Sends an animated gif of a hug!',
    requiredRoles: [],
    async execute(message, args) {
        try {
            const image = await hmtai.sfw.hug();
            await message.channel.send(image);
        } catch (error) {
            console.error('Error fetching image from hmtai:', error);
            await message.reply('❌ An error occurred while fetching the image. Please try again later.');
        }
    },
};