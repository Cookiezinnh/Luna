const mongoose = require('mongoose');

const rolecolorConfigSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    roleId: { type: String, required: true, unique: true },
    colorName: { type: String, required: true },
    customName: { type: String, required: true }
});

module.exports = mongoose.model('rolecolorConfig', rolecolorConfigSchema);