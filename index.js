require('dotenv').config();
const axios = require('axios');
const OAuth = require('oauth-1.0a');
const crypto = require('crypto');

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

const token = {
  key: process.env.ACCESS_TOKEN,
  secret: process.env.ACCESS_SECRET,
};

const data = oauth.authorize(request_data, token);

const config = {
   headers: { 'authorization': `OAuth oauth_consumer_key="${data.oauth_consumer_key}", oauth_nonce="${data.oauth_nonce}", oauth_signature="${data.oauth_signature}", oauth_signature_method="${data.oauth_signature_method}", oauth_timestamp="${data.oauth_timestamp}", oauth_token="${data.oauth_token}", oauth_version="${data.oauth_version}"` }
};

axios.post(request_data.url, request_data.data, config)
  .then(res => console.log(res.toJSON()))
  .catch(err => console.log(err.toJSON()));
