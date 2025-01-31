const fs = require('fs');
const path = require('path');
const roleConfig = require('../models/roleConfig'); // Modelo dos cargos
const Prefix = require('../models/prefix'); // Modelo do prefixo
const Bypass = require('../models/AdminBypass'); // Modelo para a lista de bypass
const BotStaffList = require('../models/botStaffList'); // Modelo da lista de staff
const config = require('../config.json'); // Configuração contendo prefixos padrão

module.exports = (client) => {
    const commandsPath = path.join(__dirname, '../commands');
    const gameCommandsPath = path.join(__dirname, '../projects/Project_Lunas/commands');

    const commands = [];
    const gameCommands = [];
    const ignoredCommands = [];

    client.commands = new Map();
    client.gameCommands = new Map();

    const loadCommands = (directory, isGameCommands = false) => {
        const files = fs.readdirSync(directory);

        files.forEach((file) => {
            const filePath = path.join(directory, file);

            if (fs.statSync(filePath).isDirectory()) {
                loadCommands(filePath, isGameCommands);
            } else if (file.endsWith('.js')) {
                handleCommand(filePath, file, isGameCommands);
            }
        });
    };

    const handleCommand = (filePath, file, isGameCommands) => {
        try {
            const command = require(filePath);

            if (!command?.data?.name && !command?.name) {
                throw new Error('Estrutura inválida: comando deve exportar "data" para slash commands ou "name" para prefix commands.');
            }

            // Criação de alias no comando
            const aliases = command.commandAlias || [];
            command.aliases = Array.isArray(aliases) ? aliases : [];
            
            const collection = isGameCommands ? client.gameCommands : client.commands;
            const commandName = command.data?.name || command.name;

            collection.set(commandName, command);

            // Adicionar alias ao Map
            command.aliases.forEach(alias => {
                if (collection.has(alias)) {
                    console.warn(`🟨 | [CommandHandler] Alias duplicado: "${alias}" já está sendo usado. Ignorando.`);
                } else {
                    collection.set(alias, command);
                }
            });

            const commandType = command.data
                ? command.supportsPrefix
                    ? `[ ${isGameCommands ? config.defaultgameprefix : config.defaultprefix} / ]`
                    : '[ / ]'
                : `[ ${isGameCommands ? config.defaultgameprefix : config.defaultprefix} ]`;

            if (command.data) {
                if (isGameCommands) {
                    gameCommands.push(command.data.toJSON());
                } else {
                    commands.push(command.data.toJSON());
                }
            }

            console.log(`${isGameCommands ? '🟪' : '🟩'} | [CommandHandler] ${commandType} Comando "${commandName}" e aliases [${command.aliases.join(', ')}] carregados com sucesso.`);
        } catch (error) {
            console.warn(`🟨 | [CommandHandler] Comando "${file}" ignorado.`);
            ignoredCommands.push({ command: file, error: error.message });
        }
    };

    try {
        loadCommands(commandsPath);
        loadCommands(gameCommandsPath, true);
    } catch (error) {
        console.error(`🟥 | [CommandHandler] Erro fatal ao carregar comandos: ${error.message}`);
    }

    client.commandData = commands;
    client.gameCommandData = gameCommands;

    if (ignoredCommands.length > 0) {
        console.warn('🟨 | [CommandHandler] Resumo de comandos ignorados:');
        ignoredCommands.forEach(({ command, error }) => {
            console.warn(` - Comando: "${command}", Erro: ${error}`);
        });
    }

    client.on('messageCreate', async (message) => {
        if (message.author.bot || !message.guild) return;

        const guildId = message.guild.id;

        // Prefixo para comandos gerais
        const guildPrefix = (await Prefix.findOne({ guildId }))?.prefix || config.defaultprefix;
        const doublePrefix = `${guildPrefix}${guildPrefix}`;

        // Prefixo para comandos de jogos
        const gamePrefix = (await Prefix.findOne({ guildId }))?.gameprefix || config.defaultgameprefix;

        const isDoublePrefix = message.content.startsWith(doublePrefix);
        const prefixToUse = isDoublePrefix ? doublePrefix : guildPrefix;
        const isGameCommand = message.content.startsWith(gamePrefix);

        if (!isGameCommand && !message.content.startsWith(prefixToUse)) return;

        const args = isGameCommand
            ? message.content.slice(gamePrefix.length).trim().split(/ +/)
            : message.content.slice(prefixToUse.length).trim().split(/ +/);

        const commandName = args.shift().toLowerCase();
        const commandCollection = isGameCommand ? client.gameCommands : client.commands;
        const command = commandCollection.get(commandName);

        if (!command) return;

        try {
            if (command.data && !command.supportsPrefix) {
                const embed = {
                    color: 0xff0000,
                    title: "Comando Indisponível via Prefixo",
                    description: `O comando \`${commandName}\` está disponível apenas como um comando **slash** (/) no Discord.`,
                    footer: {
                        text: "Use / para acessar este comando.",
                    },
                };
                return message.channel.send({ embeds: [embed] });
            }

            const memberRoles = message.member.roles.cache;
            const userBypassed = await Bypass.exists({ userId: message.author.id });

            // Verificação para comandos com StaffLocked
            if (command.StaffLocked) {
                const isStaff = await BotStaffList.exists({ userId: message.author.id });

                if (!isStaff) {
                    return message.reply(':x: Você não tem permissão para usar este comando.');
                }
            }

            if (command.requiredRoles && command.requiredRoles.length > 0) {
                if (isDoublePrefix) {
                    if (!userBypassed) {
                        return message.reply(':x: Você não está autorizado a ignorar as restrições deste comando.');
                    }
                } else {
                    const requiredRoleIds = await roleConfig.find({
                        roleName: { $in: command.requiredRoles },
                        guildId: message.guild.id,
                    }).then(roles => roles.map(role => role.roleId));

                    if (!requiredRoleIds.some(roleId => memberRoles.has(roleId))) {
                        return message.reply(':x: Você não tem permissão para usar este comando.');
                    }
                }
            }

            await command.execute(message, args);
        } catch (error) {
            console.error(`🟥 | [CommandHandler] Erro ao executar comando "${commandName}":`, error);
            await message.reply(':x: Ocorreu um erro ao executar o comando.');
        }
    });

    client.on('ready', async () => {
        try {
            if (commands.length > 0) {
                await client.application.commands.set(commands);
                console.log('🟩 | [CommandHandler] Comandos slash registrados com sucesso.');
            }
            if (gameCommands.length > 0) {
                await client.application.commands.set(gameCommands);
                console.log('🟪 | [CommandHandler] Comandos de jogos slash registrados com sucesso.');
            }
        } catch (error) {
            console.error('🟥 | [CommandHandler] Erro ao registrar comandos slash:', error);
        }
    });
};