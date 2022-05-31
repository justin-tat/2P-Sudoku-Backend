const axios = require('axios');
const express = require('express');
const helpers = require('../helpers.js');
const {pool} = require('../../database/models.js');
const gameRouter = express.Router();
const {generateUniqueBoard} = require('../generateBoard.js');


// 2b.4b:  Insert a record into games with both players info
// 2b.4c: Pass gameID and playerIDs to boards and create 2 entries in boards (p1 and p2)
// 2b.4d: Find userID in users table and update users table with board id for each player
// 2b.4e: Respond to client which should then update state variables and remove modal by setting flag in state

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
  pool.query('SELECT board_state, player_mistakes, holes, board_solution, answerable_cells, game_id FROM boards WHERE id = $1', [req.query.boardId])
  .then(info => {
    return Promise.all([info.rows[0], helpers.gameStatus(info.rows[0].game_id, pool)]);
  })
  .then(gameStatus => {
    if (gameStatus[1].rows[0].is_finished) {
      console.log('Player lost:');
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
      console.log('req.query.userId', req.query.userId);
      return helpers.updateUserIds(req.query.userId, pool);
    } else if (String(err) === 'Error: Player won'){
      throw new Error('Player won');
    } else {
      console.log('Unknown error', err);
      return Promise.reject('Unknown error', err);
    }
  })
  .then(() => {
    console.log('Successfully updated ids in user record');
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

/*
1. Determine whether game ended or not
  1a.If it did not, then find the userId of the submitting player from the games table modify that person's user table to reflect the update and update the game to finished in games
    1a.1. Send win message
    1a.2. In the get request, check the status and update that user's record if necessary. 
  1b. If it did then just send the lose message

*/

gameRouter.put('/finishGame', (req, res) => {
  let args = req.body.params;
  args.boardId = parseInt(args.boardId);
  pool.query('SELECT is_finished FROM games WHERE id = $1', [args.gameId])
  .then(answer => {
    if (answer.rows[0].is_finished) {
      res.send('You lost');
      throw new Error('You lost');
    } else {
      //return Promise.all([helpers.findUserIds(args.gameId, pool), helpers.updateFinished(args.gameId, pool)])
      return Promise.all([helpers.updateUserIds(args.userId, pool), helpers.updateFinished(args.gameId, pool)])
    }
  })
  .then(() => {
    res.send('You won');
  })
  .catch(err => {
    if (String(err) !== 'Error: You lost') {
      'ServerErrored while trying to finish the game'
      res.status(500).send('ServerErrored while trying to finish the game');
    }
  })
})



module.exports = gameRouter;