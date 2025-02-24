const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
const MinecraftServer = require('../../models/MinecraftServer'); // Ajuste o caminho conforme necessário

async function updateServerStatus(client) {
    try {
        const servers = await MinecraftServer.find();
        for (const server of servers) {
            try {
                // Faz a requisição à API do servidor de Minecraft
                const response = await axios.get(`https://api.mcsrvstat.us/2/${server.serverIp}`);
                const data = response.data;

                // Formata o MOTD em um bloco de código ANSI, removendo espaçamentos desnecessários
                const motdFormatted = data.motd?.clean
                    ?.map(line => line.trim()) // Remove espaços em branco no início e no final
                    .join('\n') || 'Sem MOTD';

                // Remove "Requires MC" e mantém apenas a versão
                const version = data.version?.replace('Requires MC ', '') || 'Sem versão';

                // Cria o embed com as informações do servidor
                const embed = new EmbedBuilder()
                    .setDescription(
                        `# :video_game: ${data.hostname || server.serverIp} [ ${version} ]\n` +
                        `\`\`\`ansi\n${motdFormatted}\n\`\`\`\n` +
                        `-# **Endereço de IP**: ${data.ip || 'Não disponível'} [ ${data.port || 'Não disponível'} ]\n` +
                        `-# **Jogadores Online**: ${data.players?.online || 0}/${data.players?.max || 0}`
                    )
                    .setColor(data.online ? 0x00FF00 : 0xFF0000) // Verde se online, vermelho se offline

                // Adiciona a lista de jogadores se houver menos de 25 jogadores online
                if (data.online && data.players?.online < 25 && data.players?.list) {
                    embed.addFields({
                        name: 'Jogadores Conectados',
                        value: data.players.list.map(player => player.name).join('\n') || 'Nenhum jogador online',
                        inline: false
                    });
                }

                // Adiciona a lista de mods, se disponível
                if (data.online && data.mods?.length > 0) {
                    embed.addFields({
                        name: 'Mods',
                        value: data.mods.map(mod => `${mod.name} (${mod.version})`).join('\n'),
                        inline: false
                    });
                }

                // Busca o canal e a mensagem
                const channel = client.channels.cache.get(server.channelId);
                if (!channel) {
                    console.error(`Canal não encontrado para o servidor ${server.serverIp}`);
                    continue;
                }

                const message = await channel.messages.fetch(server.messageId).catch(() => null);
                if (!message) {
                    console.error(`Mensagem não encontrada para o servidor ${server.serverIp}`);
                    continue;
                }

                // Edita a mensagem com o novo embed
                await message.edit({ embeds: [embed] });
                console.log(`🟩 | [MinecraftHandler] Status do servidor ${server.serverIp} atualizado.`);
            } catch (error) {
                console.error(`Erro ao atualizar o status do servidor ${server.serverIp}:`, error);
            }
        }
    } catch (error) {
        console.error('Erro ao buscar servidores no banco de dados:', error);
    }
}

module.exports = async (client) => {
    console.log('🟩 | [MinecraftHandler] Handler de Minecraft carregado com sucesso.');

    // Adiciona a função de atualização ao client para ser usada no agendamento
    client.updateMinecraftStatus = async () => {
        console.log('🟩 | [MinecraftHandler] Atualizando status dos servidores de Minecraft.');
        await updateServerStatus(client);
    };

    // Executa a primeira atualização ao carregar o handler
    await client.updateMinecraftStatus();
};