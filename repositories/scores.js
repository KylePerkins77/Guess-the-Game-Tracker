const { scoresTbl, gameScoreTbl, gamesInProgressTbl } = require('../index.js');

const _dayInMs = 86400000;

async function isValidGame(gameNum)
{
    const gameScoreRow = await gameScoreTbl.findOne({ where: { gameNum: gameNum }});
    const gameInProgressRow = await gamesInProgressTbl.findOne({ where: {gameNum: gameNum }});
    if(gameScoreRow && !gameInProgressRow)
    {
        //A score has been entered but the game is not in progress - game already ended
        return false;
    }
    return true;
}

async function setScoreTimeout(gameNum)
{
    const gameInProgressRow = await gamesInProgressTbl.findOne({ where: {gameNum: gameNum }});
    if(!gameInProgressRow)
    {
        setTimeout(() => { recordGame(gameNum); }, _dayInMs);

        await gamesInProgressTbl.create({
            gameNum: gameNum
        });
    }
}

async function restartTimeoutsInProgress()
{
    const gameInProgressRows = await gamesInProgressTbl.findAll();
    if(gameInProgressRows.length)
    {
        for(const row of gameInProgressRows)
        {
            const earliestGameScoreDateTime = await gameScoreTbl.min('createdAt', { where: { gameNum: row.gameNum }});
            const delay = _dayInMs - (new Date().getTime() - new Date(earliestGameScoreDateTime).getTime());
            
            setTimeout(() => { recordGame(row.gameNum); }, Math.max(delay, 0));
        }
    }
}

async function recordScore(gameNum, userId, gameScore)
{
    //record the score for the current game
    const gameScoreRow = await gameScoreTbl.findOne({ where: { gameNum: gameNum, userId: userId }});
    if(gameScoreRow)
    {
        console.log('Row already exists');
        return;
    }

    await gameScoreTbl.create({
       gameNum: gameNum,
       userId: userId,
       gameScore: gameScore
    });
}

async function recordGame(gameNum)
{
    const allScoreRowsForGame = await gameScoreTbl.findAll({ where: {gameNum: gameNum}});
    if(!isValidGameToRecord(allScoreRowsForGame))
    {
        await gamesInProgressTbl.destroy({ where: { gameNum: gameNum }});
        return;
    }

    const winningRows = getWinningRows(allScoreRowsForGame);
    const winningUserIds = winningRows.map(row => row.userId);
    for(const userId of winningUserIds)
    {
        console.log(`Recorded win for game num ${gameNum} for user ${userId}`);
        recordWinForUser(userId);
    }

    await gamesInProgressTbl.destroy({ where: { gameNum: gameNum }});
}

async function recordWinForUser(userId)
{
    const scoreRow = await scoresTbl.findOne({ where: { userId: userId }});
    if(scoreRow)
    {
        await scoresTbl.update({ score: scoreRow.score + 1}, { where: {userId: userId }});
    }
    else
    {
        await scoresTbl.create({ userId: userId, name: 'New Player', score: 1});
    }
}

function isValidGameToRecord(allScoreRowsForGame)
{
    if(!Array.isArray(allScoreRowsForGame))
    {
        console.log('Invalid rows in game scores table')
        return false;
    }
    if(allScoreRowsForGame.length < 3)
    {
        console.log('Not enough players - game not recorded')
        return false;
    }
    return true;
}

function getWinningRows(allScoreRowsForGame)
{
    let maxScoreFound = -100;
    let winningRows = new Array();
    for(const row of allScoreRowsForGame)
    {
        if(row.gameScore >= maxScoreFound)
        {
            if(row.gameScore > maxScoreFound)
            {
                // clear the current array
                while (winningRows.length > 0)
                {
                    winningRows.pop();
                }
            }
            maxScoreFound = row.gameScore;
            winningRows.push(row);
        }
    }
    return winningRows;
}

// function populateInitialScores()
// {
//     //Calculated on 3/24/24 - through Game #680
//     scoresTbl.create({ userId: '375493743924477954', name: 'Kyle', score: 17});
//     scoresTbl.create({ userId: '267117314770599937', name: 'John', score: 17});
//     scoresTbl.create({ userId: '227840489406201857', name: 'Chase', score: 11});
//     scoresTbl.create({ userId: '292051532248252416', name: 'Justin', score: 10});
//     scoresTbl.create({ userId: '376388513156956163', name: 'Tyler', score: 9});
//     scoresTbl.create({ userId: '327596951501537293', name: 'Joel', score: 5});
//     scoresTbl.create({ userId: '347877351335395329', name: 'Avery', score: 1});
//     scoresTbl.create({ userId: '224044602405945345', name: 'Ryan', score: 0});
// }

// function populateTestGame()
// {
//     gameScoreTbl.create({ userId: '267117314770599937', gameNum: 656, gameScore: 60});
//     gameScoreTbl.create({ userId: '227840489406201857', gameNum: 656, gameScore: 40});
//     gameScoreTbl.create({ userId: '292051532248252416', gameNum: 656, gameScore:-100});
//     gameScoreTbl.create({ userId: '224044602405945345', gameNum: 656, gameScore: 79});
// }

module.exports = { isValidGame, setScoreTimeout, recordScore, restartTimeoutsInProgress }