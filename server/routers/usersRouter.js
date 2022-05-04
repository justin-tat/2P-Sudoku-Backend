const axios = require('axios');
const express = require('express');

const userRouter = express.Router();

userRouter.get('/', (req, res) => {
  console.log('You have found me bravo');
  res.send('Barebones userRouter');
})

module.exports = userRouter;