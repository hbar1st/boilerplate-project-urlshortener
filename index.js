require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require("body-parser");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

function isValidUrl(urlString) {
  try {
    new URL(urlString);
    return true;
  } catch (error) {
    return false;
  }
}

// Example usage in an Express route:
app.post("/api/shorturl", (req, res) => {
  const pageURL = req.body.url; // Assuming imageUrl is sent in the request body
  console.log("pageURL", pageURL)
  if (isValidUrl(pageURL)) {
    // URL is valid, proceed with processing
    res.json({ original_url: pageURL, short_url });
  } else {
    // URL is invalid
    res.json({ error: "invalid url" });
  }
});

//use the function dns.lookup(host, cb) from the dns core module to verify a submitted URL.
app.get("/api/shorturl/:shorturl", (req, res) => {
  console.log("request.params.shorturl in get: ", req.params.shorturl);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
