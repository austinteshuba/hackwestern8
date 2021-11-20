const KEYS = require('./secrets');
const https = require('https');

/**
 * Given a list of shelter addresses and the user's locations, figure out the walking distance to each given shelter location.
 *
 * @param userLocation {string} should be a string representing the user's current location. Can be an intersection
 * @param shelterLocations {string[]} array of addresses for different shelters.
 * @return list of objects with the name of the shelter and the travel time measured in minutes.
 */
function getDistancesToShelters(userLocation, shelterLocations) {
  const directionsPromises = shelterLocations.map(shelterLocation => getDirections(userLocation, shelterLocation));
  return new Promise((resolve, reject) => {
    Promise.all(directionsPromises)
        .then((directionsResponses) => {
          const distances = directionsResponses.map((directionsResponse) => {
            const shelterLocation = directionsResponse.targetAddress;
            const body = directionsResponse.body;

            return {
              shelterLocation,
              travelTime: parseTravelTime(body),
              directions: parseDirections(body)
            };
          });

          resolve(distances);
        })
        .catch((err) => {
          reject(err)
        });
  });
}

function getDirections(startingAddress, targetAddress) {
  // Construct the path for the request
  //https://maps.googleapis.com/maps/api/directions/json?origin=Disneyland&destination=Universal+Studios+Hollywood&key=YOUR_API_KEY
  const options = {
    hostname: 'maps.googleapis.com',
    path: encodeURI('/maps/api/directions/json?origin='+startingAddress.replace(' ', '+') + '&destination=' + targetAddress.replace(' ', '+') + '&mode=walking&key=' + KEYS.MAPS_API_KEY),
    method: 'GET',
    timeout: 2000
  };

  return new Promise((resolve, reject) => {
    const _ = https.get(options, res => {
      let bufferString = "";

      res.on('data', d => {
        bufferString += d.toString();
      });

      res.on('end', _ => {
        if (res.statusCode >= 200 && res.statusCode <= 299) {
          resolve({statusCode: res.statusCode, targetAddress: targetAddress, headers: res.headers, body: JSON.parse(bufferString)})
        } else {
          reject({statusCode: res.statusCode, targetAddress: targetAddress, headers: res.headers, body: null});
        }

        return JSON.parse(bufferString);
      })
    });
  });
}

function parseDirections(directionsObject) {
  const routes = directionsObject.routes.sort((route1, route2) => travelTimeFromRoute(route1) - travelTimeFromRoute(route2));
  const legs = routes[0].legs;

  const setOfHtmlDirections = legs.map((leg) => {
    return leg.steps.map((step) => `${step.html_instructions} (${step.distance.text})`);
  });

  const htmlDirections = [].concat(...setOfHtmlDirections);
  let stepNumber = 1;
  return htmlDirections.map((direction) => {
    // font-size:0.9em is the styling passed by google for the final "destination will be on the left/right message"
    return direction.replace('<div style="font-size:0.9em">', '. ').replace(/<\/?[^>]+(>|$)/g, "");
  }).map((englishDirection) => {
    return `${stepNumber++}. ${englishDirection}`;
  });
}

function parseTravelTime(directionsObject) {
  const routes = directionsObject.routes.sort((route1, route2) => travelTimeFromRoute(route1) - travelTimeFromRoute(route2));
  return routes[0].legs[0].duration.value/60; // return in minutes
}

function travelTimeFromRoute(route) {
  return route.legs.reduce((sum, leg) => leg.duration.value + sum, 0);
}

getDistancesToShelters('453 St George, London ON', ['123 Richmond St, London ON', '513 First St, London ON'])
  .then((distances) => console.log(distances));