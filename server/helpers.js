
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

module.exports = {findOpponent};