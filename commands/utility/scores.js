const { SlashCommandBuilder } = require('discord.js');
const { scoresTbl, gamesInProgressTbl } = require('../../index.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('scores')
		.setDescription('Gets current set of scores'),
	async execute(interaction) {
        let message = 'Current Standings\r\n';

        const scoreRows = await scoresTbl.findAll({ order: [ ['score', 'DESC'] ]});
        for(const scoreRow of scoreRows)
        {
            message += `${scoreRow.name}: ${scoreRow.score}\r\n`;
        }
        
        message += `\r\n`;
        const gamesInProgressRows = await gamesInProgressTbl.findAll();
        if(gamesInProgressRows.length)
        {
            message += `Games not yet recorded: `;
            let addComma = false;
            for(const gameInProgress of gamesInProgressRows)
            {
                if(addComma)
                {
                    message += `, `;
                }
                message += `${gameInProgress.gameNum}`;
                addComma = true;
            }
        }
        else
        {
            message += `All games recorded`;
        }
        
		await interaction.reply(message);
	},
};