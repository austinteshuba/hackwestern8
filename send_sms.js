// Download the helper library from https://www.twilio.com/docs/node/install
// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure
const accountSid = "AC5b0ffb80bde4d421806808422efbc3af";

//Remember to hide this!
const authToken = "";
const client = require('twilio')(accountSid, authToken);

client.messages
  .create({
     body: 'Hello Ethan',
     from: '+12262421102',
     to: '+14036152427'
   })
  .then(message => console.log(message.sid));

  