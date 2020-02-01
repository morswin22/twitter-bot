require('dotenv').config();
const axios = require('axios');
const OAuth = require('oauth-1.0a');
const crypto = require('crypto');
const express = require('express');

const oauth = OAuth({
  consumer: {
    key: process.env.CONSUMER_KEY,
    secret: process.env.CONSUMER_SECRET,
  },
  signature_method: 'HMAC-SHA1',
  hash_function(base_string, key) {
    return crypto
      .createHmac('sha1', key)
      .update(base_string)
      .digest('base64')
  },
});

const request_data = {
  url: 'https://api.twitter.com/1.1/statuses/update.json?include_entities=true',
  method: 'POST',
  data: { status: 'Hello world' },
};

const request_token = {
  url: 'https://api.twitter.com/oauth/request_token',
  method: 'POST'
}

const authorize = {
  url: 'https://api.twitter.com/oauth/authorize',
  method: 'GET'
}

const token = {
  key: process.env.ACCESS_TOKEN,
  secret: process.env.ACCESS_SECRET,
};

const app = express();

app.get('/', (req, res) => {
  axios.post(request_token.url, {}, { headers: oauth.toHeader(oauth.authorize(request_token, token)) } )
    .then(resToken => {
      const regex = /(.+?)=(.+?)&/gm;
      let m;
      const fetchedToken = {};
      while ((m = regex.exec(resToken.data)) !== null) {
        if (m.index === regex.lastIndex) regex.lastIndex++;
        fetchedToken[m[1]] = m[2];
      }
      token.key = fetchedToken.oauth_token;
      token.secret = fetchedToken.oauth_token_secret;

      axios.get(authorize.url+'?oauth_token='+fetchedToken.oauth_token, { headers: oauth.toHeader(oauth.authorize(authorize, token)) } )
        .then(resAuthorize => res.send(resAuthorize.data))
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
})

app.listen(5000);