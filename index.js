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

mongoose.connect('Provide Your Own', {useUnifiedTopology: true, useFindAndModify: true});

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
  await shorturl.findOne({ urlid: id }, async (err, urlFound) => {
    if (err) {
      console.log(err);
    }
    console.log(urlFound)
    if (!urlFound) {
      res.json({
        error: 'invaild url'
      });
    } else {
      if(urlFound.urlpath) {
        console.log(urlFound)
      res.redirect(302, urlFound.protocal + "://" + urlFound.url + "/" + urlFound.urlpath);
      } else {
              res.redirect(302, urlFound.protocal + "://" + urlFound.url);
      }
    }
})
})

app.post('/api/shorturl', async (req, res) => {
  try {
  let link = req.body.url
  if (!link) return res.send({ url: 'No Url Provided' });
    const urlObject = new URL(link);
    const hostName = urlObject.hostname;
    const protocol = urlObject.protocol;
    dns.lookup(hostName, async function(err) {
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
        url: hostName,
        urlpath: link.replace(/^[a-zA-Z]{3,5}\:\/{2}[a-zA-Z0-9_.:-]+\//, ''),
        protocal: protocol.replace(':', '')
      })
      newUrl.save();

      res.json({
        original_url: link,
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

