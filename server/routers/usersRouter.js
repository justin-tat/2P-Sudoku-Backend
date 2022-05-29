
const axios = require('axios');
const express = require('express');
const {pool} = require('../../database/models.js');
const userRouter = express.Router();

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
    //console.log('user:', response.rows[0])
    if (response.rows.length === 0) {
      throw new Error('Username not found');
    }
    else if (response.rows[0].password !== req.query.password) {
      throw new Error('Password did not match');
    }
    return response.rows[0];
  })
  .catch(err => {
    //console.log(String(err));
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

//Information has already been verified once you get here
userRouter.post('/makeAccount', (req, res) => {
  let info = req.body.params;
  console.log('Found makeAccount: ', info);
  pool.query("INSERT INTO users (name, email, password, rating, difficulty) VALUES($1, $2, $3, 1000, 'easy')", [info.username, info.email, info.password])
  .then(() => {
    res.send('Successfully made account');
  })
  .catch(err => {
    console.log('error in makeAccount', err);
    res.status(500).send('Server errored while making account');
  })
  
});

module.exports = userRouter;