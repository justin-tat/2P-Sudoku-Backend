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
const helpers = require('./helpers.js');

//io.close();
/*
1. Login, find info
2. If currentBoardId is not 0, Grab board from currentBoardId
    2a. If there is a game in progress Load the board, do all the stuff
    2b. If there is not, then create the board record linking user to this record and update the 
        current board id in users table
        2b.1: Try to find a socketIO room with a comparable rating (less than 100 point difference)
        2b.2: Keep on expanding comparable rating by 100 points each time a game is not found until 1000 point difference
        2b.3: Create your own room at this point and wait
        2b.4: Once a player joins, Update tables
            2b.4a:  Insert a record into games with both players info
            2b.4b: Pass gameID and playerIDs to boards and create 2 entries in boards (p1 and p2)
            2b.4c: Find userID in users table and update users table with board id for each player
3. When the player finishes, update boardState, numMistakes, whole shebang for boards
4. Pull gameID from boards table. Set record matching gameID in games table. 
    If isFinished is not True, then set this flag and winner, otherwise tell the user they lost
5. Grab userId from games table. Set currentGameId on users to 0 and update rating accordingly
*/
io.on("connection", socket => {
  console.log('A user connected');
  console.log('socket.rooms:', socket.rooms);
  let socketId = socket.id;
  socket.on("findGame", userInfo => {
    //Try to find a socketIO room with a comparable rating (less than 100 point difference)
    //socket.join(`${userInfo.rating} ${userInfo.name}`);
    let opponent = helpers.findOpponent(userInfo, socket.rooms);
    if (opponent === '') {
      console.log('Opponent not found');
      //socket.join(`${userInfo.rating} ${userInfo.name}`);
      //socket.emit('')
      io.to(socketId).emit('waitingForOpponent');
    } else {
      console.log(`Opponent with a rating of ${opponent} found`);
      //socket.join(opponent);
      //socket.emit('Game Found');
    }
    //io.emit("Potential Game", msg);
  })
  socket.on('end', function (){
    console.log('Ending socket connection');
    socket.disconnect(true);
  });
});


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/users', userRouter);
app.use('/games', gameRouter);

app.get('/', (req, res) => {
  
  res.send('You found me');
})

// app.listen(port, () => {
//   console.log('2P Sudoku listening on ' + port);
// });

server.listen(port, () => {
  console.log('io server is listening on ' + port);
})
