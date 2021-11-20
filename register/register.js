const { time } = require('console');
const fb = require('firebase-admin/app');
const fs = require('firebase-admin/firestore');
const prompt = require('prompt');
const sa = require('./fb-key.json');

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
prompt.start()

// Helper function to get time difference in minutes
function timeDifference(time1, time2){
    // Returns time difference in minutes, input as a 24h double i.e. 11:30 pm == 23.5
    if (!time1 || !time2) return 1;
    var t1 = new Date();
    var t2 = new Date();
    t1.setMinutes((time1 - Math.floor(time1)) * 60);
    t1.setHours(Math.floor(time1))
    t2.setMinutes((time2 - Math.floor(time2)) * 60);
    t2.setHours(Math.floor(time2))
    return Math.max(Math.round(Math.abs(t1 - t2) / 60000), 1)
}


// Manually register shelters with command line input
function inputShelter() {
    prompt.get(['address', 'city', 'mealProvided', 'name', 'neighbourhood',"quiet", "openBeds", "phone", "postalCode", "totalBeds", "sleepTime", "wakeUpTime", "prereq", "tags"], function (err, result) {
        var name = result.name;
        var add = result.address;
        var city = result.city;
        var meal = result.mealProvided == null ? false : Boolean(result.mealProvided);
        var neighb = result.neighbourhood;
        var quiet = result.quiet == null ? false : Boolean(result.quiet);
        var openBeds = !result.openBeds ? null : parseInt(result.openBeds);
        var totalBeds = !result.totalBeds ? null : parseInt(result.totalBeds);
        var phone = result.phone;
        var postal = result.postalCode;
        var sleep = !result.sleepTime ? null : parseFloat(result.sleepTime);
        var wake = !result.wakeUpTime ? null : parseFloat(result.wakeUpTime);
        var tags = !result.tags ? [] : result.tags.split(",").forEach((str)=> str.toLowerCase().trim());
        var prereq = !result.prereq ? [] : result.prereq.split(",").forEach((str)=> str.toLowerCase().trim());
        setShelter(name, add, city, meal, neighb, openBeds, totalBeds, phone, postal, quiet, sleep, wake, tags, prereq)
    });
}

// Manually register users with command line input
function inputUser(){
    prompt.get(['phone', 'city', 'meal', 'sleepTime', 'quiet', 'wakeTime', 'prereq', 'neighbourhood'], function(err, result){
        var phone = result.phone;
        var city = result.city;
        var quiet = result.quiet == null ? false : Boolean(result.quiet);
        var meal = result.meal == null ? false : Boolean(result.meal);
        var neighbourhood = !result.neighbourhood ? null :result.neighbourhood;
        var sleep = !result.sleepTime ? null : parseFloat(result.sleepTime);
        var wake = !result.wakeTime ? null : Boolean(result.wakeTime);
        var prereq = !result.prereq ? [] : result.prereq.split(",").forEach((str)=> str.toLowerCase().trim());
        setUser(phone, city, meal, wake, quiet, sleep, neighbourhood, prereq, visited)
    });
}

// Set shelter in firestore
function setShelter(name, add, city, meal, neighb, openBeds, totalBeds, phone, postal, quiet, sleep, wake, tags, prereq){
    db.collection('shelters').doc(name.toUpperCase().replace(" ", "_")).set({
            name: name,
            key: name.toUpperCase().replace(" ", "_"),
            address: add,
            city: city,
            quietShelter: quiet,
            mealProvided: meal == null ? false : meal,
            neighbourhood: neighb,
            openBeds: !openBeds ? null: openBeds,
            totalBeds: !totalBeds ? null : totalBeds,
            phone: phone,
            postalCode: postal,
            sleepTime: !sleep ? null : sleep,
            wakeUpTime: !wake ? null : wake,
            tags: !tags ? [] : tags,
            prerequisites: !prereq ? [] : prereq
      });
}

// Set user in firestore
function setUser(phone, city, meal, wake, quiet, sleep, prereq){
    db.collection('users').doc(phone).set({
        phone: phone,
        city: city,
        quietShelter: quiet,
        prerequisites: !prereq ? [] : prereq,
        mealProvided: meal == null ? false : meal,
        wakeUpTime: !wake ? null : wake,
        sleepTime: !sleep ? null : sleep
    });
}

// Return all shelters from firestore, unsorted
async function getShelters(){
    const doc = await db.collection('shelters').get();
    if (doc.docs.empty) {
        console.log('No such document!');
    } else {
        var shelters = []
        doc.docs.forEach((doc)=>{
            const data = doc.data();
            shelters.push( data);
        });
        return shelters;
    }
}

// Query shelters based on intersection, meal, 
async function queryShelters(intersection, meal, quiet, wake, sleep, prereq){

    const QUIET_WEIGHT = 10;
    const MEAL_PROVIDED_WEIGHT = 20;

    const shelters = await getShelters();
    // Create list of shelter addresses
    shelterAddressList = []
    for (var i = 0; i < shelters.length; i++) {
        var shelter = shelters[i];
        shelterAddressList.push(shelter['address'] + ", " + shelter['city'] + ", " + shelter['postalCode']);
    }
    // Get travel times
    //var travelTimes = await getTravelTimes(intersection, shelterAddressList);
    const query = [];
    for (var i = 0; i < shelters.length; i++) {
        var shelter = shelters[i];
        var score = 0;
        var add = true;
        // Remove if no open beds
        if (shelter['openBeds'] == 0) add = false;
        // Include if it only has family_friendly as a prerequisite
        var inclusivelyFamilyFriendly = shelter['prerequisites'].includes("family_friendly") && shelter['prerequisites'].length == 1
        // Don't include if user query is general and shelter has multiple prereqs
        if (prereq == [] && shelter['prerequisites'].length > 0 && !inclusivelyFamilyFriendly) add = false;
        // Test constraints
        const validConstraints = ["youth", "family_friendly", "lgbtq", "indigenous", "female"]
        prereq.forEach((p)=>{
            const req = p.toLowerCase().trim().toLowerCase();
            if (validConstraints.includes(req) && !shelter['prerequisites'].includes(req)) add = false;
        });
        if (add) { 
            // Add score for preferences
           /// travelScore = traveltimes[i] == 0 ? 50 : Math.max(1, 50 / travelTimes[i]);
            if (wake && shelter['wakeUpTime'])
                score += Math.min(5, Math.round(300 / timeDifference(shelter['wakeUpTime'], wake)));
            if (sleep && shelter['sleepTime'])
                score += Math.min(5, Math.round(300 / timeDifference(shelter['sleepTime'], wake)));
            if (meal && shelter['mealProvided'])
                score += MEAL_PROVIDED_WEIGHT;
            if (quiet && shelter['quietShelter'])
                score += QUIET_WEIGHT;
           // shelter['travelTime'] = travelTimes[i][travelTime];
            shelter['score'] = score;
            query.push(shelter);
        }
    }
    // Sort query
    query.sort((a,b) => b.score - a.score);
    console.log(query);
}

// Query firestore for user, takes phone number string as input
async function getUser(phone){
    phone.replace(" ", "");
    const doc = await db.collection('users').doc(phone).get();
    if (doc.exists) return doc.data();
    else return null;
}

// Main function to submit query, takes phone number and intersection as input
async function userQuery(phone, intersection){
    if (!phone) return queryShelters(intersection, false, false, null, null, []);
    var user = await getUser(phone);
    if (user) return queryShelters(intersection, user['mealProvided'], user['quietShelter'], user['wakeUpTime'], user['sleepTime'], user['prerequisites'])
}


queryShelters("Oxford and Richmond St", false, null, 8, 23, ['female', "lgbt"]);