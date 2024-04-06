// Require the necessary discord.js classes
const fs = require('node:fs');
const path = require('node:path');
const Sequelize = require('sequelize');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');

//my guild: // "guildId": "1213316639886417962"

//Setup database connection
const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});

//Define models
const scoresTbl = sequelize.define('scores', {
	userId: {
		type: Sequelize.STRING,
		unique: true,
	},
	name: Sequelize.STRING,
	score: Sequelize.INTEGER
});

const gameScoreTbl = sequelize.define('gameScores', {
	gameNum: Sequelize.INTEGER,
    userId: Sequelize.STRING,
	gameScore: Sequelize.INTEGER
});

const gamesInProgressTbl = sequelize.define('gamesInProgress', {
	gameNum: {
		type: Sequelize.INTEGER,
		unique: true,
	}
});

//Need to export these before loading events down below, since events are dependent on them
module.exports = { scoresTbl, gameScoreTbl, gamesInProgressTbl };

// Create a new client instance
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ] 
});

//Build commands
client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

//Build events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

// Log in to Discord with your client's token
client.login(token);