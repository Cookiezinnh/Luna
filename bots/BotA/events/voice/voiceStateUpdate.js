const channels = require('../../../../shared/channels.js');
const PrivateVC = require('../../models/privateVoiceChannel.js');
const Categories = require('../../../../shared/categories.js');

let reconnectCooldown = false;

module.exports = async (client, oldState, newState) => {
    try {
        // Reconexão do bot
        if (oldState.member?.id === client.user.id && !newState.channel) {
            console.log('🟨 | [VoiceState] Bot foi desconectado. Tentando reconectar ao LILYTH_HOME_CHANNEL.');

            if (reconnectCooldown) {
                console.log('🟧 | [VoiceState] Cooldown ativo. Ignorando reconexão.');
                return;
            }

            try {
                const homeChannel = await client.channels.fetch(channels.LILYTH_HOME_CHANNEL);
                if (homeChannel?.isVoiceBased()) {
                    const currentChannel = client.distube.voices.get(oldState.guild.id)?.channel;
                    if (currentChannel?.id === homeChannel.id) {
                        console.log('🟩 | [VoiceState] O bot já está no LILYTH_HOME_CHANNEL.');
                        return;
                    }

                    reconnectCooldown = true;
                    setTimeout(() => (reconnectCooldown = false), 10000);

                    await client.distube.voices.leave(oldState.channel);
                    await client.distube.voices.join(homeChannel);
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
                    const permissions = newState.channel?.permissionOverwrites.cache.map(overwrite => overwrite.toJSON()) || [];

                    const clone = await newState.guild.channels.create({
                        name: privateVC.name,
                        type: 2,
                        parent: Categories.CLONED_VC_CATEGORY,
                        permissionOverwrites: permissions,
                    });

                    console.log(`🟩 | [VoiceState] Canal privado criado: ${clone.name} (${clone.id}).`);

                    await newState.member.voice.setChannel(clone);

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