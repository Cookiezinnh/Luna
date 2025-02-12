const mongoose = require('mongoose');

const channelConfigSchema = new mongoose.Schema({
    channelName: { type: String, required: true }, // Nome do canal predefinido
    channelId: { type: String, required: true },  // ID do canal no Discord
    guildId: { type: String, required: true },    // ID do servidor
}, { unique: ['channelName', 'guildId'] }); // Impede duplicidade de channelName por guild.

module.exports = mongoose.model('ChannelConfig', channelConfigSchema);