

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
  return dbConn.query("INSERT INTO boards (player_id, game_id, board_state, board_solution, answerable_cells, holes) VALUES($1, $2, $3, $4, $5, $6) RETURNING player_id, id, board_state, board_solution, holes, answerable_cells, game_id",[userInfo.playerId, userInfo.gameId, userInfo.boardState, userInfo.boardSolution, userInfo.answerableCells, userInfo.holes] );
};

const updateUserBoard = (player, dbConn) => {
  return dbConn.query("UPDATE users SET board_id = $1, game_id = $3, games_played = games_played + 1  WHERE id = ($2) RETURNING id", [player.boardId, player.playerId, player.gameId]);
}

const gameStatus = (gameId, dbConn) => {
  return dbConn.query("SELECT is_finished FROM games WHERE id = $1", [gameId]);
}

const updateUserIds = (userId, dbConn) => {
  return dbConn.query("UPDATE users SET board_id = 0, game_id = 0 WHERE id = $1", [userId]);
}

const findUserIds = (gameId, dbConn) => {
  return dbConn.query("SELECT p1_id, p2_id FROM games WHERE id = $1", [gameId]);
}

const updateFinished = (gameId, userId, dbConn) => {
  return dbConn.query('UPDATE games SET is_finished = $2 WHERE id = $1', [gameId, userId]);
}

const getUserStats = (userId, dbConn) => {
  return dbConn.query('SELECT games_played, highest_rating, rating, name FROM users WHERE id = $1', [userId]);
}

//UPDATE users SET rating = 1040, highest_rating = CASE  WHEN 1040 > highest_rating THEN 1040 ELSE highest_rating  END WHERE id = 1;
const updateRating = (newRating, userId, dbConn) => {
  return dbConn.query('UPDATE users SET rating = $1, highest_rating = CASE WHEN $3 > highest_rating THEN $3 ELSE highest_rating END WHERE id = $2 RETURNING rating', [newRating, userId, newRating]);
}


module.exports = {
  findOpponent, 
  makeBoard, 
  updateUserBoard, 
  gameStatus, 
  updateUserIds, 
  findUserIds, 
  updateFinished,
  getUserStats,
  updateRating,
};