const http = require('http');
const express = require('express');
const session = require('express-session');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const bodyParser = require('body-parser');

const app = express();

app.use(session({secret: 'shelter'}));
app.use(bodyParser.urlencoded({ extended: false }));

var inSetup = false;

app.post('/sms', (req, res) => {
    const smsCount = req.session.counter || 0;
    const twiml = new MessagingResponse();

    if(smsCount === 0){
        twiml.message("\n\nWelcome to Unhomed Helper. Would you like to be matched to an emergency homeless shelter? Answer YES or NO.");
        inSetup = true;
    }
    else if(smsCount === 1 && req.body.Body == 'NO' && inSetup){
        twiml.message("\n\nYou will not be matched to an emergency homeless shelter.");
        inSetup = false;
    }
    else if(smsCount === 1 && req.body.Body == 'YES' && inSetup){
        twiml.message("\n\nGreat. Would you like to be matched to the nearest shelter, or the best shelter that fits your preferences? Answer BEST or NEAREST");
    }
    else if(smsCount === 2 && inSetup){
        twiml.message("\n\nGot it. Now we need to learn a bit more about you \n\nQuestion 1. Answer YES or NO");
    }
    else if(smsCount === 3 && inSetup){
        twiml.message("\n\nQuestion 2. Answer YES or NO");
    }
    else if(smsCount === 4 && inSetup){
        twiml.message("\n\nQuestion 3. \n1 - Option 1 \n2 - Option 2 \n3 - Option 3 \n4 - Option 4 \n\nRespond with a number between 1-4");
    }
    else if(inSetup){
        twiml.message("\n\ncool");
    }
    else if (req.body.Body == 'SHELTER') {
      twiml.message('\nHere is the top shelter for you: ' + 
      '\n\nName: Unity Project \nDistance: 3km \nAvailable Beds: 12 \nDirections: .......');
    } else if (req.body.Body == 'INFO') {
      twiml.message('We respond to the following messages: ' + 
      'INFO - get information on messages\n' + 
      'SHELTER - find shelters near you\n' + 
      'PROFILE - change your preferences\n' + 
      'STOP - opt out of messages');
    } else {
      twiml.message(
        'Sorry, we did\'t understand that, please try a different message. Text INFO for information on messages.'
      );
    }

    req.session.counter = smsCount + 1;
  
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
});

http.createServer(app).listen(1337, () => {
  console.log('Express server listening on port 1337');
});

