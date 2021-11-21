const http = require("http");
const express = require("express");
const backend = require("./register/register");
const session = require("express-session");
const MessagingResponse = require("twilio").twiml.MessagingResponse;
const bodyParser = require("body-parser");

const app = express();

app.use(session({ secret: "shelter" }));
app.use(bodyParser.urlencoded({ extended: false }));

//User Profile
var phoneNum = null;
var city = null;
var quiet = false;
var meal = false;
var sleep = null;
var wake = null;
var prereq = [];
var shelterChoice = -1;
var location = null;

//Needs logic for first time user or not

var demo = false;
var pref = false;
var inSetup = true;

var questionCount = 1; //Was 1
var dict1Count = 1;
var dict2Count = 1;
var skippedPref = false;
var getLocation = false;

const dict1 = {
  // Y/N/P
  // Demographics
  1: "Great! Now we will ask some optional but recommended demographic questions. Do you identify as LGBTQ+? \nAnswer [Y] for Yes, [N] for No, and [P] to Pass.",
  2: "Are you below the age of 18? \nAnswer [Y]/[N]/[P].",
  3: "Are you accompanied by dependents below the age of 18? \nAnswer [Y]/[N]/[P].",
  4: "Do you identify as indigenous? \nAnswer [Y]/[N]/[P].",
  5: "Do you identify as female? \nAnswer [Y]/[N]/[P].",
};

const dict2 = {
  1: "What city are you in?",
  2: "Do you prefer a quieter shelter? Answer [Y]/[N].",
  3: "Do you need a meal? Answer [Y/N].",
  4: "What time do you sleep?",
  5: "What time do you wake up?",
};

const questions = {
  1: "Welcome to ShelterFirst! Let's get you set up. \nReply [Y] to continue, and [N] to abandon this session.",
  2: "To help us look for shelters near you, we need your approximate location. What intersection are you closest to right now? [ABC Street and XYZ Avenue]",
  3: "Now we will ask you some of your preferences, which will match you to a personalized shelter. \nReply [Y] to continue, and [N] to skip this step.",
  4: "Here is a list of shelters we found! Reply with the number of your preferred shelter: ", //TODO: this question needs data from the database after sending in the user profile
  5: "Would you like directions to the shelter? [Y/N]",
};

const responses = {
  1: "You will not be set up with a profile on ShelterFirst!",
  2: "Here are the directions to [location of shelter]: \n\nGoogle Maps Directions\n\n\n",
  3: "We will keep you updated on the capacity of this shelter. Your spot has been removed from our " +
    "count for the next thirty minutes, so other ShelterFirst users will not be matched to your " +
    "specific spot, but there are no guarantees about availability.",
};

var message = "def";

app.post("/sms", async (req, res) => {
  phoneNum = req.body.From;
  const user = await backend.getUser(phoneNum);
  //Check if user is new
  //If database contains phoneNum, skip the dictionary parts
  // req.body.Body.toUpperCase()
  //inSetup = user == null;
  var smsCount = req.session.counter || 0;
  const twiml = new MessagingResponse();
  var response = req.body.Body.toUpperCase().trim();

  if (inSetup) {
    if (questionCount == 1 && !getLocation) {
      //Welcome and demographics set up
      message = questions[1];
      questionCount++;
      getLocation = true;
    } else if (questionCount == 2 && getLocation) {
      if (response == "Y") {
        message = questions[2];
        questionCount++;
      } else {
        message = responses[1]; //Do not set up
        inSetup = false; //profile already created, skip straight to choose shelters
      }
    } else if (questionCount == 3 && dict1Count == 1) {
      location = response;
      demo = true;
      //Go through demo toggle
    }

    if (demo) {
      switch (dict1Count) {
        case 1:
          break;
        case 2:
          if (response == "Y") {
            prereq.push("lgbtq");
          }
          break;
        case 3:
          if (response == "Y") {
            prereq.push("youth");
          }
          break;
        case 4:
          if (response == "Y") {
            prereq.push("family_friendly");
          }
          break;
        case 5:
          if (response == "Y") {
            prereq.push("indigenous");
          }
          break;
        default:
          if (response == "Y") {
            prereq.push("female");
          }
          message = questions[3];
          //questionCount should be 2 at this point - ask for preferences
          //console.log("Everything okay?: 2= " + questionCount);
          demo = false;
          break;
      }
      if (demo) {
        message = dict1[dict1Count];
      }
      dict1Count++;
    } else if (dict1Count > 1 && dict2Count == 1) {
      //Move on to next question (3)
      questionCount++;
    }

    if (questionCount == 4 && dict2Count == 1) {
      //Catch response for preferences
      if (response == "Y") {
        pref = true;
        //Go through pref toggle
      } else {
        //Skip to next question (4)
        if (!skippedPref) {

          console.log(
            location +
            ", " +
            phoneNum +
            ", " +
            city +
            ", " +
            quiet +
            ", " +
            meal +
            ", " +
            sleep +
            ", " +
            wake +
            ", " +
            prereq
        );

          backend.setUser(phoneNum, city, meal, wake, quiet, sleep, prereq);
          const query = backend.userQuery(phoneNum, location);
          console.log(query);

          message = questions[questionCount];
          skippedPref = true;
        } else {
          questionCount++;
        }
      }
    }

    if (pref) {
      switch (dict2Count) {
        case 1:
          break;
        case 2:
          city = response;
          break;
        case 3:
          if (response == "Y") {
            quiet = true;
          }
          break;
        case 4:
          if (response == "Y") {
            meal = true;
          }
          break;
        case 5:
          sleep = response;
          break;
        default:
          wake = response;

          console.log(
            location +
            ", " +
            phoneNum +
            ", " +
            city +
            ", " +
            quiet +
            ", " +
            meal +
            ", " +
            sleep +
            ", " +
            wake +
            ", " +
            prereq
        );

          backend.setUser(phoneNum, city, meal, wake, quiet, sleep, prereq);
          //const query = await backend.userQuery(phoneNum, location);
          //console.log(query);

          message = questions[4]; //Returns all the found shelters
          //questionCount should be 3 at this point - choose shelter
          //console.log("Everything okay?: 3= " + questionCount);
          pref = false;
          break;
      }
      if (pref) {
        message = dict2[dict2Count];
      }
      dict2Count++;
    } else if (dict1Count > 1 && dict2Count > 1) {
      //Move on to next question (4)
      questionCount++;
    }

    //console.log(questionCount);
    if (questionCount == 5) {
      message = questions[questionCount]; //Do you want directions?
      shelterChoice = response; //Store response
      questionCount++;
    }
    /*
    if (questionCount == 6) {
      if (response == "Y") {
        message = questions[5]; //Then ask for the location
      } else {
        questionCount = 10;
      }
      questionCount++;
    }
    */
    if (questionCount == 7) {
      if(response == 'Y'){
        message = responses[2] + "\n\n" + responses[3]; //Then give directions
      }
      else{
        message = responses[3];
      }
    }
    if (questionCount > 8) {
      message = responses[3];
    }
  } else {
    message = "Not in setup!";
  }
  console.log(questionCount + " -- " + message);
  twiml.message(message);

  res.writeHead(200, { "Content-Type": "text/xml" });
  res.end(twiml.toString());
});

http.createServer(app).listen(1337, () => {
  console.log("Express server listening on port 1337");
});
