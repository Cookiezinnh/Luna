const { EmbedBuilder } = require('discord.js');
const { v4: uuidv4 } = require('uuid'); // Pacote para gerar UUIDs
const Luna = require('../../../../models/lunas'); // Modelo do MongoDB

module.exports = {
    name: 'start',
    description: 'Crie seu perfil no bot e comece sua jornada!',
    commandAlias: ['iniciar'],
    async execute(message) {
        const userId = message.author.id;
        const username = message.author.username;

        try {
            // Verificar se o usuário já possui um perfil
            const existingUser = await Luna.findOne({ userId });

            if (existingUser) {
                return message.reply('Você já possui um perfil registrado no sistema!');
            }

            // Criar a picareta inicial com um UUID único
            const initialPickaxe = {
                id: Date.now(), // ID único da picareta
                uuid: uuidv4(), // Gera um UUID único para a picareta
                name: 'Picareta de Pedra Comum',
                quantitybuff: 1,
                hastebuff: 1,
                blockbuff: 1,
            };

            // Criar novo perfil do usuário
            const newUser = new Luna({
                userId: userId,
                username: username,
                tier: 1, // Tier inicial
                money: 50, // Dinheiro inicial
                blocksDestroyed: 0, // Quantidade inicial de blocos destruídos
                accountCreatedAt: new Date(), // Data de criação do perfil
                inventory_pickaxes: [initialPickaxe], // Adiciona a picareta inicial ao inventário
                equipped_pickaxe: initialPickaxe, // Equipa a picareta inicial
            });

            // Salvar no banco de dados
            await newUser.save();

            // Enviar mensagem de confirmação
            const embed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle('Perfil Criado com Sucesso!')
                .setDescription(
                    `Bem-vindo, ${username}!\n\n` +
                    `Seu perfil foi criado com sucesso.\n` +
                    `Dinheiro inicial: **50** moedas.\n` +
                    `Tier inicial: **1**.\n\n` +
                    `**Picareta Inicial:**\n` +
                    `- Nome: ${initialPickaxe.name}\n` +
                    `- Quantidade Buff: ${initialPickaxe.quantitybuff}\n` +
                    `- Velocidade Buff: ${initialPickaxe.hastebuff}\n` +
                    `- Resistência Buff: ${initialPickaxe.blockbuff}\n\n` +
                    `Boa sorte na sua jornada!`
                )
                .setFooter({ text: 'Use os comandos disponíveis para começar sua aventura!' });

            return message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Erro ao criar o perfil:', error);
            return message.reply('Houve um erro ao criar seu perfil. Por favor, tente novamente mais tarde.');
        }
    },
};