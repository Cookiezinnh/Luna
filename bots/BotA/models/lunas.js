const mongoose = require('mongoose');

const pickaxeSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    uuid: { type: String, required: true }, // Campo obrigatório
    name: { type: String, required: true },
    quantitybuff: { type: Number, default: 0 },
    hastebuff: { type: Number, default: 0 },
    blockbuff: { type: Number, default: 0 },
});

const lunaSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    tier: { type: Number, default: 1 },
    money: { type: Number, default: 50 },
    blocksDestroyed: { type: Number, default: 0 },
    accountCreatedAt: { type: Date, default: Date.now },
    inventory: [
        {
            id: { type: Number, required: true },
            name: { type: String, required: true },
            quantity: { type: Number, default: 0 },
        },
    ],
    inventory_minerals: [
        {
            id: { type: Number, required: true },
            name: { type: String, required: true },
            quantity: { type: Number, default: 0 },
        },
    ],
    inventory_resources: [
        {
            id: { type: Number, required: true },
            name: { type: String, required: true },
            quantity: { type: Number, default: 0 },
        },
    ],
    inventory_pickaxes: [pickaxeSchema], // Usa o subesquema de picaretas
    equipped_pickaxe: {
        id: { type: String },
        name: { type: String },
        hastebuff: { type: Number, default: 1 },
        quantitybuff: { type: Number, default: 1 },
        blockbuff: { type: Number, default: 1 },
    },
});

module.exports = mongoose.model('Luna', lunaSchema);