const channels = require('../../../../shared/channels.js');
const PrivateVC = require('../../models/privateVoiceChannel.js');
const Categories = require('../../../../shared/categories.js');

module.exports = async (client, oldState, newState) => {
    try {
        // Verificar se o bot foi desconectado
        if (oldState.member?.id === client.user.id && !newState.channel) {
            console.log('🟨 | [VoiceState] Bot foi desconectado. Tentando reconectar ao LILYTH_HOME_CHANNEL.');

            try {
                const homeChannel = await client.channels.fetch(channels.LILYTH_HOME_CHANNEL);
                if (homeChannel?.isVoiceBased()) {
                    await client.distube.voices.leave(oldState.channel); // Remove qualquer conexão antiga
                    await client.distube.voices.join(homeChannel); // Reconecta ao canal correto
                    console.log(`🟩 | [VoiceState] Reconectado ao canal LILYTH_HOME_CHANNEL: ${homeChannel.name}`);
                } else {
                    console.error('🟥 | [VoiceState] LILYTH_HOME_CHANNEL não é um canal de voz válido.');
                }
            } catch (error) {
                console.error('🟥 | [VoiceState] Erro ao reconectar ao LILYTH_HOME_CHANNEL:', error);
            }
        }

        // Gerenciamento de canais privados
        if (newState.channelId) {
            const privateVC = await PrivateVC.findOne({ voiceChannelId: newState.channelId });

            if (privateVC) {
                try {
                    // Obter permissões do canal original
                    const permissions = newState.channel?.permissionOverwrites.cache.map(overwrite => overwrite.toJSON()) || [];

                    // Criar canal privado
                    const clone = await newState.guild.channels.create({
                        name: privateVC.name,
                        type: 2, // Tipo de canal de voz
                        parent: Categories.CLONED_VC_CATEGORY,
                        permissionOverwrites: permissions,
                    });

                    console.log(`🟩 | [VoiceState] Canal privado criado: ${clone.name} (${clone.id}).`);

                    // Mover o usuário para o novo canal
                    await newState.member.voice.setChannel(clone);

                    // Verificar se o canal está vazio e deletá-lo
                    const interval = setInterval(async () => {
                        if (clone.members.size === 0) {
                            clearInterval(interval);

                            if (newState.guild.channels.cache.has(clone.id)) {
                                console.log(`🟧 | [VoiceState] Canal vazio encontrado e deletado: ${clone.name} (${clone.id}).`);
                                await clone.delete();
                            }
                        }
                    }, 5000);
                } catch (error) {
                    console.error('[VoiceStateUpdate] Erro ao gerenciar canal privado:', error);
                }
            }
        }
    } catch (error) {
        console.error('[VoiceStateUpdate] Erro geral:', error);
    }
};