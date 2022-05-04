const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { pool } = require('../database/models.js');
const userRouter = require('./routers/usersRouter.js');

const app = express();
const port = process.env.port || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/users', userRouter);

app.get('/', (req, res) => {
  
  res.send('You found me');
})

app.listen(port, () => {
  console.log('2P Sudoku listening on ' + port);
});
