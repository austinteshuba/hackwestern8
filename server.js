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

//prereqs
var lgbtq = ""

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
    4: "Directions ask",
    5: "Location"
}

const responses = {
    1: "NO - 1",
    2: "Directions give",
    3: "We will keep you updated"
}

var message = "def";

app.post('/sms', (req, res) => {

    phoneNum = req.body.From;

    //Check if user is new
        //If database contains phoneNum, skip the dictionary parts
    // req.body.Body.toUpperCase()

    var smsCount = req.session.counter || 0;
    const twiml = new MessagingResponse();
    var response = req.body.Body.toUpperCase();

    if(questionCount == 1){
        //Welcome and demographics set up
        message = questions[1]; 
        questionCount ++;
    }
    else if(questionCount == 2 && dict1Count == 1){
        if(response == 'Y'){
            demo = true;
        }
        else{
            message = responses[1];
            inSetup = false; //profile already created, skip straight to choose shelters
        }
    }

    if(demo){
        switch (dict1Count){
            case 1:
                if (response == 'Y'){

                }
        }



        if(dict1Count <= 5){
            message = dict1[dict1Count];
            dict1Count ++;
        }
        else{
        //console.log(questions[2]);
            message = questions[2];
            dict1Count ++;
            demo = false;
        }
    }
    else if(dict1Count > 1 && dict2Count == 1){
        questionCount++;
    }
    
    if(questionCount == 3 && dict2Count == 1){
        if(response == 'Y'){
            pref = true;
        }
        else {
            questionCount ++;
        }
    }
    
    //Else skip
    if(pref){
        if(dict2Count <= 6){
            message = dict2[dict2Count];
            dict2Count ++;
        }
        else {
            message = questions[questionCount]; //choose shelter
            dict2Count ++;
            pref = false;
        }
    }
    else if(dict1Count > 1 && dict2Count > 1){
        questionCount ++;
    }

    console.log(questionCount);
    if(questionCount == 4){
        message = questions[questionCount];
        shelterChoice = response;
        questionCount ++;
    }
    else if(questionCount == 5){
        message = questions[5];
        questionCount ++;
    }
    else if(questionCount == 6){
        if(response == 'Y'){
            message = responses[2];
        }
    }
    if(questionCount > 5){
        message = responses[3];
    }

    twiml.message(message);
    console.log(message);
  
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
});

http.createServer(app).listen(1337, () => {
  console.log('Express server listening on port 1337');
});  