const mongoose = require('mongoose');

const roleConfigSchema = new mongoose.Schema({
    roleName: { type: String, required: true },
    roleId: { type: String, required: true },
    guildId: { type: String, required: true }, // Adicionando guildId
}, { unique: ['roleName', 'guildId'] }); // Impede duplicidade de roleName por guild.

module.exports = mongoose.model('RoleConfig', roleConfigSchema);
