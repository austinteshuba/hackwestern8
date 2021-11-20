// File to handle requests to and from db

let express = require('express');
let router = express.Router();

// Home page route.
router.get('/', function (req, res) {
  res.send('HelloWorld');
});

module.exports = router;