

const findOpponent = (userInfo, rooms) => {
  let userRating = userInfo.rating;
  let opponent = '';
  for(var offset = 100; offset < 1001; offset += 100) {
    rooms.forEach((value, key) => {
      if (key.includes(' ')) {
        let roomRating = parseInt(key.split(' ')[0], 10);
        if (roomRating > userRating - offset && roomRating < userRating + offset) {
          opponent = key;
        }
      }
    });
  }
  return opponent;
};


const makeBoard = (userInfo, dbConn) => {
  return dbConn.query("INSERT INTO boards (player_id, game_id, board_state, board_solution) VALUES($1, $2, $3, $4) RETURNING player_id, id, board_state, board_solution",[userInfo.playerId, userInfo.gameId, userInfo.boardState, userInfo.boardSolution] );
};

const updateUserBoard = (player, dbConn) => {
  return dbConn.query("UPDATE users SET board_id = ($1) WHERE id = ($2) RETURNING id", [player.boardId, player.playerId]);
}

module.exports = {findOpponent, makeBoard, updateUserBoard};