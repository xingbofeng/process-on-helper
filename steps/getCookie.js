const Chance = require('chance');
const request = require('request');
const cheerio = require('cheerio');
const chance = new Chance();

module.exports = function getCookie({ url, jar, email }, callback) {
  request({
    method: 'GET',
    uri: url,
    jar,
  }, function(err, response) {
    if (err) {
      return callback(err);
    }
    callback(null, email);
  });
}
