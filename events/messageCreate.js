const { Events } = require('discord.js');
const { isGuessTheGamePost, getGameNumber, getGameScore } = require('../logic/guessTheGame.js');
const { setScoreTimeout, recordScore, isValidGame } = require('../repositories/scores.js')

module.exports = {
	name: Events.MessageCreate,
	async execute(message) {
        const content = message.content;
        const userId = message.author.id;
        if(content == 'popTest')
        {
            populateTestGame();
        }
        if(isGuessTheGamePost(content))
        {
            const gameNum = getGameNumber(content);
            if(!gameNum || gameNum === NaN)
            {
                return;
            }
            if(!isValidGame(gameNum))
            {
                console.log('Game already ended: ', gameNum);
                return;
            }

            const gameScore = getGameScore(content);
            console.log(`${userId} scored ${gameScore} in game ${gameNum}`);
            if(gameScore >= -100)
            {
                try
                {
                    setScoreTimeout(gameNum);
                    recordScore(gameNum, userId, gameScore);
                }
                catch(error)
                {
                    console.log(error);
                    console.log('Game Num: ' + gameNum);
                    console.log('User Id: ', userId);
                    console.log('Score: ', gameScore);
                }
            }
        }
	},
};