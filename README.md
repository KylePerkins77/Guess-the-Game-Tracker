Discord bot to track guess the game scores.
Written in javascript, using discord.js, node.js, and sqlite3.

You need a config.json file in the root directory with the following json properties:
* token - bot service token string
* clientId - bot client application id
* guildId - discord server guild/channel id to host commands

You'll also need a sqlite3 database to store the scores - it assumes a database.sqlite file in the root directory of the project. This should get created automatically when you run the code for the first time, as long as you have sqlite3 installed.

Initialization happens in index.js. The bot then waits for events to occur from the discord server. See the events folder for each event it handles - the main one is messageCreate.js, which is where the bot handles incoming messages.
The bot reads messages sent to the server and parses them to see if it follows the standard Guess the Game share-format. If so, it calculates a score for the user:
* Wrong: -10 points
* Wrong: but correct series: -1 points
* Right: 100 points

24 hours after the first guess is made for a game, the people with the highest score for that game will earn 1 point (a game is not scored if fewer than 3 people played that game).

There are two commands for the bot, stored in teh commands/utility folder:
* /ping: to see if the bot is active
* /scores: to see the current overall scores, and which games have not yet been scored (games in progress)
You can run "node deploy-commands.js" to redeploy the commands.
Otherwise you must run "node index.js" to start the bot so it can read messages and handle scoring.

