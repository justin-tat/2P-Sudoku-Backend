const axios = require('axios');
const express = require('express');
const {pool} = require('../../database/models.js');
const userRouter = express.Router();

userRouter.get('/', (req, res) => {
  console.log('You have found me bravo');
  res.send('Barebones userRouter');
})

userRouter.get('/getAccount', (req, res) => {
  console.log(req.query);
  
});

module.exports = userRouter;