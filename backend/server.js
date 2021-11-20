const express = require('express');
const app = express();
const port = 3000;
const path = require('path');

let shelterRoute = require('./routes/shelter.js');

app.use('/', express.static(path.join(__dirname, '../frontend')));
app.use('/shelter', shelterRoute);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});