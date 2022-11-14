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
app.use(function (req, res, next) {
      console.info(`${req.method} ${req.originalUrl}`) 

    res.on('finish', () => {
        console.info(`${res.statusCode} ${res.statusMessage}; ${res.get('Content-Length') || 0}b sent`)
    })

    next()
})

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/api/shorturl/:id', async (req, res) => {
  const { id } = req.params;
  let num = isNum(id);
  if(num === false) return res.send({ short_url: "Must be a number."});
console.log(id)
  await shorturl.findOne({ urlid: id }, async (err, urlFound) => {
    if (err) {
      console.log('findOne() error');
    }
    console.log(urlFound)
    if (!urlFound) {
      res.json({
        error: 'invaild url'
      });
    } else {
      res.redirect(301, "https://" + urlFound.url);
    }
})
})

app.post('/api/shorturl', async (req, res) => {
  try {
  let url = req.body.url
  let find = await shorturl.find({ url: url });
  if (!url) return res.send({ url: 'No Url Provided' });
  let protocal = url.replace(/(^\w+:|^)\/\//, '')
  let workurl = protocal.split('/')[0];
    console.log(workurl.replace(':', ''))
    console.log(workurl)
    console.log(protocal)
    console.log(url)
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
        url: workurl,
        urlpath: protocal,
        protocal: workurl.replace(':', '')
      })
      newUrl.save();

      res.send({
        original_url: url,
        short_url: pageid
      })
    }
  })
  } catch(err) {
    console.log(err)
  }
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

