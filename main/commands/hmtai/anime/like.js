const Hmtai = require('hmtai');
const hmtai = new Hmtai();

module.exports = {
    name: 'like',
    commandAlias: ['like-gif', 'animelike'],
    description: 'Sends an animated gif of liking something!',
    requiredRoles: [],
    async execute(message, args) {
        try {
            const image = await hmtai.sfw.like();
            await message.channel.send(image);
        } catch (error) {
            console.error('Error fetching image from hmtai:', error);
            await message.reply('❌ An error occurred while fetching the image. Please try again later.');
        }
    },
};