const axios = require('axios');
const Cookie = require('../../models/musicCookie');

module.exports = {
    name: 'savecookie',
    description: 'Salva um cookie para uso do bot.',
    commandAlias: ['cookie-save', 'setcookie'],
    requiredRoles: [],
    StaffLocked: true,

    async execute(message, args) {
        if (args.length < 1 && !message.attachments.size) {
            return message.reply(':x: Uso incorreto! Envie o cookie no comando ou anexe um arquivo .txt contendo os cookies.');
        }

        let cookieData = '';

        if (message.attachments.size > 0) {
            const attachment = message.attachments.first();
            if (!attachment.name.endsWith('.txt')) {
                return message.reply(':x: O arquivo deve ser um .txt contendo os cookies.');
            }

            try {
                const response = await axios.get(attachment.url, { responseType: 'text' });
                cookieData = response.data;
            } catch (error) {
                console.error('[ERRO] Falha ao baixar o arquivo de cookies:', error);
                return message.reply(':x: Ocorreu um erro ao processar o arquivo.');
            }
        } else {
            cookieData = args.join(' ');
        }

        if (!cookieData.includes('youtube.com')) {
            return message.reply(':x: O cookie fornecido não parece ser válido para o YouTube.');
        }

        try {
            await Cookie.findOneAndUpdate(
                {},
                { cookieText: cookieData, lastUpdated: new Date() },
                { upsert: true, new: true }
            );
            return message.reply('✅ Cookie salvo com sucesso!');
        } catch (error) {
            console.error('[ERRO] Falha ao salvar o cookie no banco de dados:', error);
            return message.reply(':x: Ocorreu um erro ao salvar o cookie.');
        }
    },
};