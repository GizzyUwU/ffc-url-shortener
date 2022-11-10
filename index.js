let mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const URL = require("url").URL;
let shorturl = require('./models/shorten');
      
mongoose.connect('nono');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/api/shorturl/:id', async (req, res, next) => {
  try {
  let param = req.params.id;
  let find = await shorturl.findOne({ urlid: param });
  if(!find) return res.redirect('/');
  res.redirect(find.url);
  } catch(err) {
    console.log(err)
  }
})

app.post('/api/shorturl', async (req, res) => {
    let urlcheck = []
    let url = req.body.url;
    if(!url) return res.send({ url: 'No Url Provided'})

    const urlsystem = (s) => {
      try {
        console.log(s)
        new URL(s);
        return true;
      } catch (err) {
        console.log(err)
        return false;
      }
    };
    let check = urlsystem(url);
    console.log(check)
    if(check === false) return res.send({ url: 'Invalid URL'});
    if(check === true) {
// Creating the buffer object with utf8 encoding
let bufferObj = Buffer.from(url, "utf8");

// Encoding into base64
let base64String = bufferObj.toString("base64");

// Printing the base64 encoded string
console.log("The encoded base64 string is:", base64String);

let newUrl = new shorturl({
  urlid: base64String,
  url: url,
})
newUrl.save();

res.send({ 
  original_url: url,
  shorturl: base64String
})
}
})

// Your first API endpoint
app.get('/api/:id', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

