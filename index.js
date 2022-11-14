let mongoose = require('mongoose');
const express = require('express');
const cors = require('cors')
const app = express();
const bodyParser = require('body-parser');
var dns = require('dns')
let shorturl = require('./models/shorten');
function isNum(str) {
  return /\d/.test(str)
}

mongoose.connect('mongodb+srv://freecodecamp:freecodecamp@cluster0.hwsa1vu.mongodb.net/urlshortener', {useUnifiedTopology: true, useFindAndModify: true});

// Basic Configuration
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/api/shorturl/:id', async (req, res) => {
  const { id } = req.params;
  let num = isNum(id);
  if(num === false) return res.send({ short_url: "Must be a number."});

  await shorturl.findOne({ urlid: id }, async (err, urlFound) => {
    if (err) {
      console.log('findOne() error');
    }
    if (!urlFound) {
      res.json({
        error: 'invaild url'
      });
    } else {
      res.redirect("https://" + urlFound.url);
    }
})
})

app.post('/api/shorturl', async (req, res) => {
  let url = req.body.url
  let find = await shorturl.find({ url: url });
  if (!url) return res.send({ url: 'No Url Provided' });
  if (find) return res.send({ orignal_url: url, short_url: find.urlid });
  let workurl = url.replace(/(^\w+:|^)\/\//, '');
  dns.lookup(workurl, async function(err) {
    if (err) {
      res.send({ error: "invalid url" });
    } else {
      let count = await shorturl.find().then((docs) => {
        let count = docs.length;
        return count;
      });
      let pageid = count + 1;
      let newUrl = new shorturl({
        urlid: pageid,
        url: url,
      })
      newUrl.save();

      res.send({
        original_url: url,
        short_url: pageid
      })
    }
  })
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

