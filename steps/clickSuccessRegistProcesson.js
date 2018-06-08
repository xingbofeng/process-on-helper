const Chance = require('chance');
const request = require('request');
const cheerio = require('cheerio');
const chance = new Chance();

module.exports = function clickSuccessRegistProcesson(uri, callback) {
  request.get(uri, function(err, response, body) {
    if (err) {
      return callback(err);
    }
    const $ = cheerio.load(body);
    const href = $('[data-x-div-type=body] p > [tabindex="-1"]').eq(1).text().trim();
    if (!href) {
      return callback(new Error('the email is not ok, please restart'));
    }
    request.get(href, function(err, response, body) {
      if (err) {
        return callback(err);
      }
      callback(null);
    });
  });
}