
const axios = require('axios');
const express = require('express');
const {pool} = require('../../database/models.js');
const userRouter = express.Router();
const timeago = require('timeago.js');

const helpers = require('../helpers.js');

userRouter.get('/', (req, res) => {
  console.log('You have found me bravo');
  res.send('Barebones userRouter');
})

userRouter.get('/verifyAccount', (req, res) => {
  pool.query('SELECT COUNT(1) FROM users WHERE name = $1', [req.query.username])
  .then(response => {
    //console.log('user:', res.rows[0])
    if (+response.rows[0].count !== 0) {
      throw new Error('That username is already taken!');
    }
    return pool.query('SELECT COUNT(1) FROM users WHERE email = $1', [req.query.email]);
  })
  .catch(err => {
    //console.log('There seemed to be an error in verifyAccount', err);
    res.status(409).send('Username is already taken');
    return Promise.reject('username was taken');
  })
  .then(response => {
    if (+response.rows[0].count !== 0) {
      throw new Error('That email is already taken!');
    }
    res.send("You're big chillin");
    res.end();
  })
  .catch((err) => {
    if (String(err) === 'Error: That email is already taken!') {
      res.status(409).send('Email has an account');
    }
  })
});

userRouter.get('/getAccount', (req, res) => {
  pool.query('SELECT id, name, password, rating, difficulty, board_id FROM users WHERE name = $1', [req.query.username])
  .then(response => {
    if (response.rows.length === 0) {
      throw new Error('Username not found');
    }
    else if (response.rows[0].password !== req.query.password) {
      throw new Error('Password did not match');
    }
    return response.rows[0];
  })
  .catch(err => {
    if (String(err) === 'Error: Username not found') {
      return Promise.reject('Username not found');
    } else if (String(err) === 'Error: Password did not match') {
      return Promise.reject('Password did not match');
    }
    return Promise.reject('Unknown err ' + err);
  })
  .then(response => {
    res.send(response);
  })
  .catch(err => {
    console.log(String(err));
    if (String(err) === 'Username not found') {
      res.status(409).send('Username not found');
    } else if (String(err) === 'Password did not match') {
      res.status(409).send('Password did not match that account');
    }
  })
});

userRouter.post('/makeAccount', (req, res) => {
  console.log("req.url: " + req.url);
  console.log('req.body.params: ', req.body.params);
  let info = req.body.params;
  pool.query("INSERT INTO users (name, email, password, rating, difficulty) VALUES($1, $2, $3, 1000, 'easy')", [info.username, info.email, info.password])
  .then(() => {
    res.send('Successfully made account');
  })
  .catch(err => {
    console.log('error in makeAccount', err);
    res.status(500).send('Server errored while making account');
  })
  
});


userRouter.get('/gameHistory', (req, res) => {
  console.log("req.query", req.url);
  helpers.getGames(req.query.userId, pool)
  .then((games) => {
    let results = [];
    let user_id = parseInt(req.query.userId);
    games.rows.forEach((game, index) => {
      let opponentName = game.p1_id === user_id ? game.p2_name : game.p1_name;
      let opponentRating = game.p1_id === user_id ? game.p2_rating : game.p1_rating;
      let winningId = game.is_finished === game.p1_name ? game.p1_id : game.p2_id;
      let didWin = winningId === user_id ? true : false;
      let gameTime = timeago.format(game.time);

      results.push({
        date: gameTime,
        opponent: opponentName,
        opponentRating: opponentRating,
        win: didWin
      });

    });
    res.send(results);
  })
  .catch(err => {
    console.log('Errored in get gameHistory: ', err);
    res.status(500).send(err);
  })
})

module.exports = userRouter;