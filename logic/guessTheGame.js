module.exports = {
	isGuessTheGamePost(messageContent)
    {
        return messageContent && messageContent.indexOf('#GuessTheGame') === 0;
    },
	getGameNumber(messageContent) 
    {
        const gameNumSearchAry = messageContent.match(/[#]\d+/);
        if(gameNumSearchAry && Array.isArray(gameNumSearchAry))
        {
            const gameNumWithHashtag = gameNumSearchAry[0];
            const gameNum = Number(gameNumWithHashtag.slice(1));
            
            if(Number.isInteger(gameNum) && gameNum > 0)
            {
                return gameNum;
            }
        }
        return NaN;
	},
    getGameScore(messageContent)
    {
        const numRedSquares = messageContent.split('🟥').length - 1;
        const numYellowSquares = messageContent.split('🟨').length - 1;
        const numGreenSquares = Math.min(messageContent.split('🟩').length - 1, 1)
        const scoreTemp = (numRedSquares * -10) + (numYellowSquares * -1) + (numGreenSquares * 100)
        const score = Math.max(scoreTemp, -100);
        return score;
    }
};