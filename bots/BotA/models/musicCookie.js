const mongoose = require('mongoose');

const cookieSchema = new mongoose.Schema({
    cookieText: {
        type: String,
        required: true, // O campo é obrigatório
    },
    lastUpdated: {
        type: Date,
        default: Date.now, // Define a data atual como valor padrão
    },
});

// Cria o modelo "Cookie" com base no schema
const Cookie = mongoose.model('Cookie', cookieSchema);

module.exports = Cookie;