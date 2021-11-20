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

function inputShelter() {
    prompt.get(['address', 'city', 'mealProvided', 'name', 'neighbourhood', "openBeds", "phone","family", "postalCode", "totalBeds", "sleepTime", "wakeUpTime", "prereq", "tags"], function (err, result) {
        var name = result.name;
        var add = result.address;
        var city = result.city;
        var meal = result.mealProvided == null ? false : Boolean(result.mealProvided);
        var neighb = result.neighbourhood;
        var openBeds = !result.openBeds ? null : parseInt(result.openBeds);
        var totalBeds = !result.totalBeds ? null : parseInt(result.totalBeds);
        var family = result.family == null ? false : Boolean(result.mealProvided);
        var phone = result.phone;
        var postal = result.postalCode;
        var sleep = !result.sleepTime ? null : parseFloat(result.sleepTime);
        var wake = !result.wakeUpTime ? null : parseFloat(result.wakeUpTime);
        var tags = !result.tags ? [] : result.tags.split(",").forEach((str)=> str.trim());
        var prereq = !result.prereq ? [] : result.prereq.split(",").forEach((str)=> str.trim());
        setShelter(name, add, city, meal, neighb, openBeds, totalBeds, phone, postal, family, sleep, wake, tags, prereq)
    });
}

function inputUser(){
    prompt.get(['phone', 'city', 'family', 'meal', 'sleepTime', 'wakeTime', 'prereq', 'neighbourhood', 'visited'], function(err, result){
        var phone = result.phone;
        var city = result.city;
        var meal = result.meal == null ? false : Boolean(result.meal);
        var neighbourhood = !result.neighbourhood ? null :result.neighbourhood;
        var family = result.family == null ? false : Boolean(result.family);
        var sleep = !result.sleepTime ? null : parseFloat(result.sleepTime);
        var wake = !result.wakeTime ? null : Boolean(result.wakeTime);
        var prereq = !result.prereq ? [] : result.prereq.split(",").forEach((str)=> str.trim());
        var visited = !result.visited ? [] : result.visited.split(",").forEach((str)=> str.trim());
        setUser(phone, city, family, meal, wake, sleep, neighbourhood, prereq, visited)
    });
}

function setShelter(name, add, city, meal, neighb, openBeds, totalBeds, phone, postal, family, sleep, wake, tags, prereq){
    db.collection('shelters').doc(name.toUpperCase().replace(" ", "_")).set({
            name: name,
            key: name.toUpperCase().replace(" ", "_"),
            address: add,
            city: city,
            mealProvided: meal == null ? false : meal,
            neighbourhood: neighb,
            openBeds: !openBeds ? null: openBeds,
            totalBeds: !totalBeds ? null : totalBeds,
            familyFriendly: family == null ? false: family,
            phone: phone,
            postalCode: postal,
            sleepTime: !sleep ? null : sleep,
            wakeUpTime: !wake ? null : wake,
            tags: !tags ? [] : tags,
            prerequisites: !prereq ? [] : prereq
      });
}

function setUser(phone, city, family, meal, wake, sleep, neighbourhood, prereq, visited){
    db.collection('users').doc(phone).set({
        phone: phone,
        city: city,
        prerequisites: !prereq ? [] : prereq,
        neighbourhood: !neighbourhood ? null : neighbourhood,
        familyFriendly: family == null ? false : family,
        mealProvided: meal == null ? false : meal,
        wakeUpTime: !wake ? null : wake,
        visited: !visited ? [] : visited,
        sleepTime: !sleep ? null : sleep
    });
}

async function getShelters(){
    const doc = await db.collection('shelters').get();
    if (doc.docs.empty) {
        console.log('No such document!');
    } else {
        var shelters = []
        doc.docs.forEach((doc)=>{
            const data = doc.data();
            shelters.add(data);
            console.log(data['name'] + ": ", data);
        });
        return data;
    }
}

async function getUser(phone){
    const doc = await db.collection('users').doc(phone).get();
    if (doc.exists) return doc.data();
    else console.log('User not found');
}

inputUser();