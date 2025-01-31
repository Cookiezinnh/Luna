const Hmtai = require('hmtai');
const hmtai = new Hmtai();

module.exports = {
    name: 'sleep',
    commandAlias: ['sleep-gif', 'animesleep'],
    description: 'Sends an animated gif of sleeping!',
    requiredRoles: [],
    async execute(message, args) {
        try {
            const image = await hmtai.sfw.sleep();
            await message.channel.send(image);
        } catch (error) {
            console.error('Error fetching image from hmtai:', error);
            await message.reply('❌ An error occurred while fetching the image. Please try again later.');
        }
    },
};