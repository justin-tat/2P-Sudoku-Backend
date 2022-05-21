const axios = require('axios');
const express = require('express');
const {pool} = require('../../database/models.js');
const gameRouter = express.Router();

gameRouter.post('/makeGame', (req, res) => {
  let info = req.query;
  let p1 = JSON.parse(info.playerOne);
  let p2 = JSON.parse(info.playerTwo);
  pool.query("INSERT INTO games (p1_id, p2_id, p1_name, p2_name, p1_rating, p2_rating) VALUES($1, $2, $3, $4, $5, $6) RETURNING id", [p1.id, p2.id, p1.name, p2.name, p1.rating, p2.rating])
  .then((id) => {
    console.log('Successfully made the game record with id of: ', id);
    res.send('Successfully made game');
  })
  .catch(err => {
    console.log('error in makeGame', err);
    res.status(500).send('Server errored while making game');
  })
  //res.send('Barebones gameRouter');
});

module.exports = gameRouter;