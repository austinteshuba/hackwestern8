const fb = require('firebase-admin/app');
const fs = require('firebase-admin/firestore');
const sa = require('./../../register/fb-key.json');
var bodyParser = require('body-parser');
// create application/json parser
var jsonParser = bodyParser.json();

const firebaseConfig = {
  apiKey: "AIzaSyADxWWAVBVUvE_4x7VscXRFLrb5vw0NETY",
  authDomain: "shelterbot-33158.firebaseapp.com",
  projectId: "shelterbot-33158",
  credential: fb.cert(sa),
  storageBucket: "shelterbot-33158.appspot.com",
  messagingSenderId: "352507503317",
  appId: "1:352507503317:web:d32b097c3a0be5e5b0785c",
  measurementId: "G-P2PV69HMJZ"
};

// Initialize Firebase
const app = fb.initializeApp(firebaseConfig);
const db = fs.getFirestore(app);

let express = require('express');
let router = express.Router();

router.use(jsonParser);

// All shelters route
router.get('/shelters', async function (req, res) {
  const shelters = await db.collection('shelters').get()
  var response = [];
  if (shelters.docs.length > 0) shelters.docs.forEach((doc)=> response.push(doc.data()));
  res.send(JSON.stringify(response));
});

// Shelter details route, takes parameter "name" (primary key; first letters capitalized) 
router.get('/shelterDetails', async function (req, res) {
  const shelters = await db.collection('shelters').doc(req.query.name).get();
  var response = shelters.exists ? shelters.data() : {}
  res.send(JSON.stringify(response));
});

// New shelter route
// prerequisites should be an array containing any of the following:
// ["youth", "family_friendly", "lgbtq", "indigenous", "female"]
// quietShelter, mealProvided are bools; openBeds and totalBeds are ints; sleepTime and wakeUpTime are doubles
router.post('/newShelter', async function (req, res) {
    const body = req.body;
    console.log(body);
    const key = body.name.split(' ').join('_');
    db.collection('shelters').doc(key).set({
      name: body.name,
      key: key,
      address: body.address,
      city: body.city,
      quietShelter: body.quietShelter,
      mealProvided: body.mealProvided == null ? false : body.mealProvided,
      neighbourhood: body.neighbourhood ? body.neighbourhood : null,
      openBeds: body.openBeds,
      totalBeds: body.totalBeds,
      phone: body.phone,
      postalCode: body.postalCode,
      sleepTime: !body.sleepTime ? null : body.sleepTime,
      wakeUpTime: !body.wakeUpTime ? null : body.wakeUpTime,
      tags: !body.tags ? [] : body.tags,
      prerequisites: !body.prerequisites ? [] : body.prerequisites
  });
  res.status(200).end();
});


// Beds update route, takes parameters "name" (primary key; first letters capitalized) and "openBeds" (int0
router.put('/bedsUpdate', async function (req, res) {
  const body = req['body'];
  db.collection('shelters').doc(body.name.trim().replace(" ", "_")).update({
    openBeds: body.openBeds
  });
  res.status(200).end();
});

module.exports = router; 