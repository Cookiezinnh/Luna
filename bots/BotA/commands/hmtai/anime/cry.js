const Hmtai = require('hmtai');
const hmtai = new Hmtai();

module.exports = {
    name: 'cry',
    commandAlias: ['cry-gif', 'animecry'],
    description: 'Sends an animated gif of crying!',
    requiredRoles: [],
    async execute(message, args) {
        try {
            const image = await hmtai.sfw.cry();
            await message.channel.send(image);
        } catch (error) {
            console.error('Error fetching image from hmtai:', error);
            await message.reply('❌ An error occurred while fetching the image. Please try again later.');
        }
    },
};