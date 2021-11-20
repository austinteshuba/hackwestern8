const http = require('http');
const express = require('express');
const session = require('express-session');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const bodyParser = require('body-parser');

const app = express();

app.use(session({secret: 'shelter'}));
app.use(bodyParser.urlencoded({ extended: false }));

var phoneNum = "";

var inSetup = true;
var skipSetup = false;
//Needs logic for first time user or not

const responses = {
    0: "\nWelcome to ShelterFirst! \nWould you like to be matched to an emergency homeless shelter? \nAnswer YES or NO.",
    1: "You will not be matched to an emergency homeless shelter.",
    2: "Now we need to learn a bit more about you. \n\nQuestion 1. Answer YES or NO",
    3: "Question 2. Answer YES or NO",
    4: "Question 3",
    5: "Question 4",
    6: "Question 5",
    7: "Thank you! We would like to know about your preferences now. \nText YES to agree or NO to skip this step.",
    8: "Do you have a religious affiliation? \nAnswer YES or NO",
    9: "Do you prefer a specific area of town? \nAnswer YES or NO",
    10: "What time do you like to go to bed? \nAnswer with a number",
    11: "Thank you for your preferences. Here are a list of shelters that you are eligible for, "
    + "along with their current capacities. \n\n LIST OF SHELTERS 1-5 HERE \n\nWhich shelter would you like to match to? " + 
    "Answer with a number between 1-5",
    12: "You've skipped the setup process. Here are a list of shelters that you are eligible for, "
    + "along with their current capacities. \n\n LIST OF SHELTERS 1-5 HERE \n\nWhich shelter would you like to match to? " + 
    "Answer with a number between 1-5",
    13: "Alright, sounds great. Do you need directions? Answer YES or NO",
    14: "DIRECTIONS GO HERE." + "\n\n\nWe will keep you updated on the capacity of this shelter. Your spot has been removed from our count"
    + " for the next thirty minutes, so other ShelterFirst users will not be matched to your specific spot, but there are no guarantees about availability.",
    15: "We will keep you updated on the capacity of this shelter. Your spot has been removed from our count"
    + " for the next thirty minutes, so other ShelterFirst users will not be matched to your specific spot, but there are no guarantees about availability.",
}

app.post('/sms', (req, res) => {

    phoneNum = req.body.From;

    //Check if user is new
        //If database contains phoneNum, skip the dictionary parts

    var smsCount = req.session.counter || 0;
    const twiml = new MessagingResponse();
    var message = "";

    if(smsCount >= 15){
        inSetup = false;
    }

    else if(smsCount == 1 && req.body.Body.localeCompare('YES') && inSetup){
        smsCount = 2;
        message = responses[smsCount];
    }
    else if(smsCount == 1 && inSetup){
        message = responses[1];
        inSetup = false;
    }
    //Skip preferences
    else if(smsCount == 8 && req.body.BodylocaleCompare('NO') && inSetup){
        skipSetup = true;
        smsCount = 12;
        message = responses[12];
    }
    //Say yes to answering preferences
    else if(smsCount == 8 && req.body.BodylocaleCompare('YES') && inSetup){
        message = responses[smsCount];
    }
    //Handle end of answering
    else if(!skipSetup && smsCount == 11){
        skipSetup = true;
        smsCount = 12;
        message = responses[11];
    }
    //Say yes to directions
    else if(smsCount == 14 && req.body.BodylocaleCompare('YES') && inSetup){
        message = responses[14];
        smsCount = 15;
        inSetup = false;
    }
    //Say no to directions
    else if(smsCount == 14 && req.body.BodylocaleCompare('NO') && inSetup){
        message = responses[15];
        smsCount = 15;
        inSetup = false;
    }
    else if(inSetup){
        message = responses[smsCount];
    }
    if(!inSetup){
        message = "OK";
    }

    twiml.message(message);

    req.session.counter = smsCount + 1;
  
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
});

http.createServer(app).listen(1337, () => {
  console.log('Express server listening on port 1337');
});  