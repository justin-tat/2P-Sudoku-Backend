const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const ip = require('ip');
const ipAddress = ip.address();

// const credentials = {
//   key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem'), {encoding: 'utf8'} ),
//   cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem'), {encoding: 'utf8'} )
// };

// const credentials = {
//   key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')),
//   cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem'))
// };
//console.log(credentials);

const app = express();
const port = process.env.port || 3000;
//const server = require('https').createServer(credentials, app);
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
            2b.4a. Join the room. Then emit to the room. On opponentFound, do the rest of the stuff. 
            2b.4b:  Insert a record into games with both players info
            2b.4c: Pass gameID and playerIDs to boards and create 2 entries in boards (p1 and p2) (promise.all)
            2b.4d: Find userID in users table and update users table with board id for each player
            2b.4e: Respond to client which should then update state variables and remove modal by setting flag in state
3. When the player finishes, update boardState, numMistakes, whole shebang for boards
4. Pull gameID from boards table. Set record matching gameID in games table. 
    If isFinished is not True, then set this flag and winner, otherwise tell the user they lost
5. Grab userId from games table. Set currentGameId on users to 0 and update rating accordingly
*/
io.on("connection", socket => {
  let opponent = '';

  socket.on("findGame", userInfo => {
    console.log(socket.adapter.rooms);
    opponent = helpers.findOpponent(userInfo, socket.adapter.rooms);
    if (opponent === '') {
      io.to(socket.id).emit('waitingForOpponent');
      socket.join(`${userInfo.rating} ${userInfo.id} ${userInfo.name}`);
    } else {
      socket.join(opponent);
      io.to(socket.id).emit('makeRecord', opponent);
    }
    //io.emit("Potential Game", msg);
  });
  socket.on('gameRecordCreated', (info) => {
    io.to(info.opponent).emit('startGame', info);
  })
  socket.on('end', function (){
    console.log('Ending socket connection');
    socket.disconnect(true);
  });
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors({
  origin: '*'
}));

app.use('/users', userRouter);
app.use('/games', gameRouter);

app.get('/', (req, res) => {
  
  res.send('You found me');
})

// app.listen(port, () => {
//   console.log('2P Sudoku listening on ' + port);
// });

server.listen(port, '0.0.0.0', () => {
  console.log('io server is listening on ' + port);
  console.log(`Network access via: ${ipAddress}:${port}!`);
})
