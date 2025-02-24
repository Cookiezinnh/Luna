const mongoose = require('mongoose');

const minecraftServerSchema = new mongoose.Schema({
    messageId: { type: String, required: true, unique: true },
    serverIp: { type: String, required: true },
    guildId: { type: String, required: true },
    channelId: { type: String, required: true },
});

module.exports = mongoose.model('MinecraftServer', minecraftServerSchema);