const KEYS = require('./secrets');
const https = require('https');

// const options = {
//   hostname: 'example.com',
//   port: 443,
//   path: '/todos',
//   method: 'GET'
// };
//
// const req = https.request(options, res => {
//   console.log(`statusCode: ${res.statusCode}`)
//
//   res.on('data', d => {
//     process.stdout.write(d)
//   })
// })
//
// req.on('error', error => {
//   console.error(error)
// })
//
// req.end()

function getDirections(targetAddress, startingAddress) {
  // Construct the path for the request
  //https://maps.googleapis.com/maps/api/directions/json?origin=Disneyland&destination=Universal+Studios+Hollywood&key=YOUR_API_KEY
  const options = {
    hostname: 'maps.googleapis.com',
    path: '/maps/api/directions/json?origin='+startingAddress.replace(' ', '+') + '&destination=' + targetAddress.replace(' ', '+') + '&key=' + KEYS.MAPS_API_KEY,
    method: 'GET',
    timeout: 2000
  };
  console.log(options);

  const req = https.get(options, res => {
    console.log(`statusCode: ${res.statusCode}`);

    res.on('data', d => {
      console.log(d.toString());
    })
  }, );

  req.on('error', e => {
    console.error(e);
  });
  // req.write();

  // req.end();
}

getDirections('Universal Studios', 'DisneyLand');