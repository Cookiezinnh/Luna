const mongoose = require('mongoose');

const adminBypassSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    userId: { type: String, required: true },
});

module.exports = mongoose.model('AdminBypass', adminBypassSchema);