require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require("body-parser");
const mongoose = require('mongoose');

//the MONGO_URI is coming from the cluster on AtlasDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());


// mongo collection setup via mongoose schema?
// we state what we want our documents to look like by creating a schema
let urlSchema = new mongoose.Schema({
  url: { type: String, required: true },
  shorturl: { type: Number, required: true, unique: true }
});

// the model that links between our schema and the collection in mongodb
let URLRecord = mongoose.model("URLRecord", urlSchema);

let shortURLS = [];

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.use("/api/shorturl", bodyParser.urlencoded()); 

function isValidUrl(urlString) {
  try {
    new URL(urlString);
    return true;
  } catch (error) {
    return false;
  }
}

// Example usage in an Express route:
app.post("/api/shorturl", async (req, res) => {
  
  const pageURL = req.body.url; // Assuming imageUrl is sent in the request body
  console.log("pageURL", pageURL);

  if (isValidUrl(pageURL)) {
    // URL is valid, proceed with processing
    let shorturl = await createAndSaveURLRecord(pageURL);
    console.log("shorturl -> ", shorturl);
    res.json({ original_url: pageURL, short_url: shorturl });
  } else {
    // URL is invalid
    res.json({ error: "invalid url" });
  }
  
});

//use the function dns.lookup(host, cb) from the dns core module to verify a submitted URL.
app.get("/api/shorturl/:shorturl", async (req, res) => {
  console.log("request.params.shorturl in get: ", req.params.shorturl);
  const url = await findOneByShortUrl(req.params.shorturl);
  if (url) {
    res.redirect(url); 
  } else {
    res.json({ error: "invalid url" });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});


const createAndSaveURLRecord = async (url) => {
  let shorturl = 0;

  const count = await URLRecord.countDocuments();
  if (count === 0) {
    shorturl = 1;
  } else {
    // find the largest number used in shorturl before
    let result = await URLRecord.aggregate([
      {
        $group: {
          _id: null, // Groups all documents into a single group
          maxValue: { $max: "$shorturl" },
        },
      },
      { $project: { _id: 0, maxValue: 1 } },
    ]);
    shorturl = result[0]["maxValue"] + 1 ;
  }


  // when we want to create new document, we instantiate the model (URLRecord)
  let urlRecord = new URLRecord({
    url,
    shorturl,
  });

  // then we can save the new instance of Person to the database
  const doc = await urlRecord.save();
  return doc.shorturl;
};

const findOneByShortUrl = async (shorturl, done) => {
  const queryResult = await URLRecord.findOne(
    { shorturl }
  );
  if (queryResult) {
    console.log(queryResult);
    return queryResult.url;
  } else {
    return null;
  }
};