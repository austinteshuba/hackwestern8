const express = require('express');
const app = express();
const port = 3000;
const path = require('path');

app.use('/', express.static(path.join(__dirname, '../frontend')));

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});