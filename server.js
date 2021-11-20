const http = require('http');
const express = require('express');
const session = require('express-session');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const bodyParser = require('body-parser');

const app = express();

app.use(session({secret: 'shelter'}));
app.use(bodyParser.urlencoded({ extended: false }));

//User Profile
var phoneNum = "";
var city = "";
var quiet = false;
var meal = false;
var neighbourhood = "";        
var sleep = -1;
var wake = -1;
var prereq = [];
var shelterChoice = -1;

//Needs logic for first time user or not

var demo = false;
var pref = false;
var inSetup = false;

var questionCount = 1;
var dict1Count = 1;
var dict2Count = 1;
var responseCount = 1;

const dict1 = {
    // Y/N/P
    // Demographics
    1: "LGBTQ+",
    2: "Youth",
    3: "Family",
    4: "Addiction",
    5: "Female",
}

const dict2 = {
    1: "City",
    2: "Quiet",
    3: "Meal",
    4: "Neighborhood",
    5: "Sleep",
    6: "Wake",
}

const questions = {
    1: "Welcome & Set up",
    2: "Fill preferences",
    3: "Choose shelter",
    4: "Directions",
    5: "Location"
}

const responses = {
    1: "NO - 1",
    2: "Directions",
    3: "We will keep you updated"
}

app.post('/sms', (req, res) => {

    phoneNum = req.body.From;

    //Check if user is new
        //If database contains phoneNum, skip the dictionary parts
    // req.body.Body.toUpperCase()

    var smsCount = req.session.counter || 0;
    const twiml = new MessagingResponse();
    var message = "";
    var response = req.body.Body.toUpperCase();

    if(questionCount == 1){
        message = questions[1];
        questionCount ++;
    }
    if(questionCount == 2 && dict1Count == 1){
        if(response == 'Y'){
            demo = true;
        }
        else{
            message = responses[0];
        }
    }

    if(demo && dict1Count <= 5){
        message = dict1[dict1Count];
        dict1Count ++;
    }
    if(dict1Count > 5){
        message = questions[questionCount];
        questionCount ++;
    }

    if(questionCount == 2 && response == 'Y' && dict1Count > 5){
        pref = true;
    }
    //Else skip

    if(pref && dict2Count <= 6){
        message = dict2[dict2Count];
        dict2Count ++;
    }
    if(dict1Count > 6){
        message = questions[questionCount];
        questionCount ++;
    }

    if(questionCount == 3){
        shelterChoice = response;
        questionCount ++;
    }
    if(questionCount == 4){
        message = questions[questionCount];
        if(response == 'Y'){
            message = responses[2];
        }
        questionCount ++;
    }

    if(questionCount > 4){
        message = responses[3];
    }


  
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
});

http.createServer(app).listen(1337, () => {
  console.log('Express server listening on port 1337');
});  