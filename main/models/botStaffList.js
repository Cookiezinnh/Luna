const mongoose = require('mongoose');

const botStaffListSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
});

module.exports = mongoose.model('botStaffList', botStaffListSchema);