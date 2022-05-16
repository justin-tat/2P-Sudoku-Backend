
const findOpponent = (userInfo, rooms) => {
  let userRating = userInfo.rating;
  for(var offset = 100; offset < 1001; offset += 100) {
    for (let room of rooms) {
      if (room.includes(' ')) {
        let roomRating = parseInt(room.split(' ')[0], 10);
        if (roomRating > userRating - offset && roomRating < userRating + offset ) {
          return room;
        }
      }
    }
  }
  return '';
};

module.exports = {findOpponent};