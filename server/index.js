const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.port || 3000;
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const { pool } = require('../database/models.js');
const userRouter = require('./routers/usersRouter.js');
const gameRouter = require('./routers/gamesRouter.js');

io.on("connection", socket => {
  console.log('A user connected');
})


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/users', userRouter);
app.use('/games', gameRouter);

app.get('/', (req, res) => {
  
  res.send('You found me');
})

app.listen(port, () => {
  console.log('2P Sudoku listening on ' + port);
});
