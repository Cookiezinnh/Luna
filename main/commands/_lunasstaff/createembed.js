const { ChannelType } = require('discord.js');
const axios = require('axios');

module.exports = {
    name: 'createembed',
    description: 'Envia uma mensagem embed para um canal especificado usando um JSON ou arquivo.',
    commandAlias: ['create-embed', 'embed-create', 'embedcreate', 'creatembd'],
    requiredRoles: [], // Sem restrição de cargo
    StaffLocked: true, // Caso queira restringir para staff, troque para "true"

    async execute(message, args) {
        // Verifica se foram passados os argumentos corretos
        if (args.length < 1 && !message.attachments.size) {
            return message.reply(':x: Uso incorreto! O formato é: `!sendembed <canal> <JSON>` ou anexe um arquivo contendo o JSON.');
        }

        // Obtém o canal
        const channelInput = args.shift(); // Primeiro argumento é o canal
        const channel = message.guild.channels.cache.get(channelInput.replace(/[<#>]/g, ''));
        if (!channel || channel.type !== ChannelType.GuildText) {
            return message.reply(':x: Canal inválido. Por favor, insira um canal válido.');
        }

        let embedData;

        // Verifica se há anexos na mensagem
        if (message.attachments.size > 0) {
            const attachment = message.attachments.first();
            if (!attachment.name.endsWith('.json')) {
                return message.reply(':x: O arquivo anexado deve ser um .json.');
            }

            try {
                const response = await axios.get(attachment.url, { responseType: 'text' });
                embedData = JSON.parse(response.data);
            } catch (error) {
                console.error('[ERRO] Falha ao processar o arquivo do embed:', error);
                return message.reply(':x: Erro ao processar o arquivo anexado. Certifique-se de que é um JSON válido.');
            }
        } else {
            // Caso não haja anexo, usa o JSON fornecido nos argumentos
            const jsonInput = args.join(' ');

            try {
                embedData = JSON.parse(jsonInput);
            } catch (error) {
                console.error('[ERRO] Falha ao processar o JSON do embed:', error);
                return message.reply(':x: JSON inválido. Verifique o formato e tente novamente.');
            }
        }

        // Verifica se o JSON contém "content" ou "embeds"
        if (!embedData.content && !embedData.embeds) {
            return message.reply(':x: O JSON fornecido deve conter "content" ou "embeds".');
        }

        // Tenta enviar a mensagem no canal especificado
        try {
            await channel.send(embedData);
            return message.reply(`✅ Embed enviado com sucesso no canal ${channel}!`);
        } catch (error) {
            console.error('[ERRO] Falha ao enviar o embed:', error);
            return message.reply(':x: Ocorreu um erro ao enviar o embed. Certifique-se de que o JSON está correto.');
        }
    },
};