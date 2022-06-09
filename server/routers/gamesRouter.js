const axios = require('axios');
const express = require('express');
const helpers = require('../helpers.js');
const {pool} = require('../../database/models.js');
const gameRouter = express.Router();
const {generateUniqueBoard} = require('../generateBoard.js');
const Elo = require('elo-calculator');

const elo = new Elo({
  rating: 1000,
  k: [40, 20, 10]
});

gameRouter.post('/makeGame', (req, res) => {
  let info = req.body.params;
  let p1 = info.playerOne;
  let p2 = info.playerTwo;
  pool.query("INSERT INTO games (p1_id, p2_id, p1_name, p2_name, p1_rating, p2_rating) VALUES($1, $2, $3, $4, $5, $6) RETURNING id, p1_id, p2_id", [p1.id, p2.id, p1.name, p2.name, p1.rating, p2.rating])
  .then(id => {
    let info = id.rows[0];
    let holes = 1;
    let boardState = generateUniqueBoard(holes);
    boardState[1] = JSON.stringify(boardState[1]);
    boardState[2] = JSON.stringify(boardState[2]); 

    let p1 = {
      gameId: info.id, 
      playerId: info.p1_id, 
      boardState: boardState[1], 
      boardSolution: boardState[2],
      answerableCells: boardState[1],
      holes: holes
    };
    let p2 = {
      gameId: info.id, 
      playerId: info.p2_id, 
      boardState: boardState[1], 
      boardSolution: boardState[2], 
      answerableCells: boardState[1],
      holes: holes
    };

    return Promise.all([helpers.makeBoard(p1, pool), helpers.makeBoard(p2, pool), holes]);
  })
  .then(arr => {
    let p1Info = arr[0].rows[0];
    let p2Info = arr[1].rows[0];
    let p1 = {boardId: p1Info.id, playerId: p1Info.player_id, gameId: p1Info.game_id}
    let p2 = {boardId: p2Info.id, playerId: p2Info.player_id, gameId: p1Info.game_id};
    return Promise.all([helpers.updateUserBoard(p1, pool), helpers.updateUserBoard(p2, pool), p1Info.board_state, p1Info.board_solution, arr[2], p1Info.game_id]);
  })
  .then(toUsers => {
    let p1 = toUsers[0].rows[0].id;
    let p2 = toUsers[1].rows[0].id;
    let board = {boardState: toUsers[2], boardSolution: toUsers[3], holes: toUsers[4], game_id: toUsers[5]};
    res.send(board);
  })
  .catch(err => {
    console.log('error in makeGame', err);
    res.status(500).send('Server errored while making game');
  })
});

gameRouter.get('/getGame', (req, res) => {
  let newRating = 0;
  pool.query('SELECT board_state, player_mistakes, holes, board_solution, answerable_cells, game_id FROM boards WHERE id = $1', [req.query.boardId])
  .then(info => {
    return Promise.all([info.rows[0], helpers.gameStatus(info.rows[0].game_id, pool)]);
  })
  .then(gameStatus => {
    if (gameStatus[1].rows[0].is_finished) {
      throw new Error('Player lost');
      
    } else {
      console.log('GameStatus[0]', gameStatus[0])
      return gameStatus[0]
    }
  })
  .then((gameInfo) => {
    res.send(gameInfo);
    throw new Error('Player won');
  })
  .catch(err => {
    console.log('Error in getGame: ', String(err) === 'Error: Player lost');
    if (String(err) === 'Error: Player lost') {
      //console.log('req.query.userId', req.query.userId);
      return helpers.updateUserIds(req.query.userId, pool);
      //return Promise.all([helpers.updateUserIds(req.query.userId, pool), helpers.updateRating(req.query.userId, newRating, pool)])
    } else if (String(err) === 'Error: Player won'){
      throw new Error('Player won');
    } else {
      console.log('Unknown error', err);
      return Promise.reject('Unknown error', err);
    }
  })
  .then(() => {
    console.log('Successfully updated ids in user record when fetching losing game');
    res.send('You lost');
  })
  .catch(err => {
    if (String(err) !== 'Error: Player won') {
      console.log('Server errored while fetching continued game');
      res.status(500).send('Server errored while fetching continued game');
    }
  })
});

gameRouter.put('/updateGame', (req, res) => {
  let args = req.body.params;
  let board = JSON.stringify(args.boardState)
  pool.query('UPDATE boards SET board_state = $1, player_mistakes = player_mistakes + $2 WHERE id = $3', [board, Object.keys(args.incorrectTiles).length, args.boardId])
  .then(() => {
    res.send('Successfully updated game');
  })
});

//Return an object with isFinished and new rating
//Look at games table to find both ids => X
  // find highest rating/current rating/ gamesPlayed for both.
  // Determine which id is the asking player to find out who won based off of isFinished logic already implemented, calculate new Elos and update asking person's record
gameRouter.put('/finishGame', (req, res) => {
  console.log('Finish game req.body.params', req.body.params);
  let args = req.body.params;
  let rating = 0;
  args.boardId = parseInt(args.boardId);

  helpers.findUserIds(args.gameId, pool)
  .then(userIdsPromise => {
    let userIds = userIdsPromise.rows[0];
    return Promise.all([helpers.getUserStats(userIds.p1_id, pool), helpers.getUserStats(userIds.p2_id, pool), userIds])
  }).then((userStats) => {
    //Pass along userData and determine whether it's finished or not
    return Promise.all([ pool.query('SELECT is_finished FROM games WHERE id = $1', [args.gameId]) , userStats[0].rows[0] , userStats[1].rows[0], userStats[2] ]);
  })
  .then(arr => {
    console.log('Elo.length: ', elo.players.length);
    let isFinished = arr[0].rows[0].is_finished === true ? 'You lost' : 'You won';
    console.log('p1Stats: ', arr[1]);
    console.log('p2Stats: ', arr[2]);
    console.log('arr[3]: ', arr[3]);
    console.log(`p1_id: ${arr[3].p1_id} ||| p2_id: ${arr[3].p2_id}`);
    console.log('isFinished: ', isFinished);
    //Tie ids to their stats
    arr[1].id = arr[3].p1_id;
    arr[2].id = arr[3].p2_id;
    //Determine whether askingUser/requestingPlayer is p1 or p2 and set waitingUser/Player to the other
    // let askingUser = args.userId === arr[1].id ? arr[1] : arr[2];
    // let waitingUser = args.userId === arr[2].id ? arr[1] : arr[2];

    let askingUser = {};
    let waitingUser = {};

    if(args.userId === arr[1].id) {
      askingUser = arr[1];
      waitingUser = arr[2];
    } else {
      askingUser = arr[1];
      waitingUser = arr[2];
    }
    console.log('askingUser: ', JSON.stringify(askingUser));
    console.log('waitingUser: ', JSON.stringify(waitingUser));
    console.log('arr[2].id:', arr[2].id);
    let reqPlayer = elo.createPlayer(askingUser.rating, parseInt(askingUser.games_played), askingUser.highest_rating, askingUser.id.toString());
    let waitingPlayer = elo.createPlayer(waitingUser.rating, parseInt(waitingUser.games_played), waitingUser.highest_rating, waitingUser.id.toString());
    if (arr[0].rows[0].is_finished === true) {
      console.log('Requesting player lost');
      elo.updateRatings([
        [reqPlayer, waitingPlayer, 0]
      ]);
    } else {
      console.log('Requesting player lost');
      elo.updateRatings([
        [reqPlayer, waitingPlayer, 1]
      ]);

    }
    elo.players.forEach((player, i) => {
      console.log(`Player ${i}: ${JSON.stringify(player)}`);
    })
    let reqPlayerRating = Math.round(elo.players[0].rating);
    let waitingPlayerRating = Math.round(elo.players[1].rating);
    //Empty elo of players
    elo.players = [];

    return Promise.all([
      helpers.updateUserIds(args.userId, pool), 
      helpers.updateFinished(args.gameId, pool), 
      isFinished, 
      helpers.updateRating(reqPlayerRating, parseInt(reqPlayer.name), pool), 
      helpers.updateRating(waitingPlayerRating, parseInt(waitingPlayer.name), pool),
      //helpers.updateHighestRating(reqPlayerRating, parseInt(reqPlayer.name), pool), 
      //helpers.updateHighestRating(waitingPlayerRating, parseInt(waitingPlayer.name), pool),
    ]);
  })
  .then((promiseArr) => {
    // let responseObject = {isFinished: isFinished, newRating: promiseArr[2].rows[0].rating};
    // res.send(responseObject);
    console.log('requestingPlayer:', promiseArr[3].rows[0]);
    console.log('waitingPlayer:', promiseArr[4].rows[0]);
    res.send({isFinished: promiseArr[2]});
    //res.send('You won');
  })
  .catch(err => {
    if (String(err) !== 'Error: You lost') {
      console.log('Errored in finishGame: ', err);
      res.status(500).send('ServerErrored while trying to finish the game');
    }
  })
})

module.exports = gameRouter;