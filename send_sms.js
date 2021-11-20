// Download the helper library from https://www.twilio.com/docs/node/install
// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure
const accountSid = "AC5b0ffb80bde4d421806808422efbc3af";
const authToken = "5e28a7f211dfd060157146b64ff64e04";
const client = require('twilio')(accountSid, authToken);

client.messages
  .create({
     body: 'Hello Ethan!',
     from: '+14036152427',
     to: '+15199842619'
   })
  .then(message => console.log(message.sid));