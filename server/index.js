const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.port || 3000;

app.get('/', (req, res) => {
  console.log('You found me in the console');
  res.send('You found me');
})

app.listen(port, () => {
  console.log('2P Sudoku listening on ' + port);
});
