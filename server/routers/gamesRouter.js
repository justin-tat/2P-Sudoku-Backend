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
    let holes = 25;
    let boardState = generateUniqueBoard(holes);
    boardState[1] = JSON.stringify(boardState[1]);
    boardState[2] = JSON.stringify(boardState[2]); 
    let p1 = {
      gameId: info.id, 
      playerId: info.p1_id, 
      boardState: boardState[1], 
      boardSolution: boardState[2],
      answerableCells: boardState[1]
    };
    let p2 = {
      gameId: info.id, 
      playerId: info.p2_id, 
      boardState: boardState[1], 
      boardSolution: boardState[2], 
      answerableCells: boardState[1]
    };

    return Promise.all([helpers.makeBoard(p1, pool), helpers.makeBoard(p2, pool), holes]);
  })
  .then(arr => {
    let p1Info = arr[0].rows[0];
    let p2Info = arr[1].rows[0];
    let p1 = {boardId: p1Info.id, playerId: p1Info.player_id}
    let p2 = {boardId: p2Info.id, playerId: p2Info.player_id};
    return Promise.all([helpers.updateUserBoard(p1, pool), helpers.updateUserBoard(p2, pool), p1Info.board_state, p1Info.board_solution, arr[2]]);
  })
  .then(toUsers => {
    let p1 = toUsers[0].rows[0].id;
    let p2 = toUsers[1].rows[0].id;
    let board = {boardState: toUsers[2], boardSolution: toUsers[3], holes: toUsers[4]};
    res.json(board);
  })
  .catch(err => {
    console.log('error in makeGame', err);
    res.status(500).send('Server errored while making game');
  })
  //res.send('Barebones gameRouter');
});

gameRouter.get('/getGame', (req, res) => {
  pool.query('SELECT board_state, player_mistakes, holes, board_solution, answerable_cells FROM boards WHERE id = $1', [req.query.boardId])
  .then(info => {
    res.send(info.rows[0]);
  }) 
})



module.exports = gameRouter;