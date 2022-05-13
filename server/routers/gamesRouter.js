const axios = require('axios');
const express = require('express');
const {pool} = require('../../database/models.js');
const gameRouter = express.Router();

gameRouter.post('/findGame', (req, res) => {
  console.log('found game router');
  res.send('Barebones gameRouter');
});

module.exports = gameRouter;