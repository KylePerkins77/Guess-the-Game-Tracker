const { Events } = require('discord.js');
const { scoresTbl, gameScoreTbl, gamesInProgressTbl } = require('../index.js');
const { restartTimeoutsInProgress } = require('../repositories/scores.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
        scoresTbl.sync();
        gameScoreTbl.sync();
        gamesInProgressTbl.sync();
		restartTimeoutsInProgress();
		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};