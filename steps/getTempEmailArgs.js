const Chance = require('chance');
const request = require('request');
const cheerio = require('cheerio');
const chance = new Chance();

module.exports = function getTempEmailArgs(url, jar, callback) {
  request({
    method: 'GET',
    uri: url,
    jar,
  }, function(err, response, body) {
    if (err) {
      return callback(err);
    }
    const $ = cheerio.load(body);
    const formElement = $('.bform > form');
    const csrf = formElement.find('input[name=csrf]').attr('value').trim();
    const domain = $('#domain').find('option').attr('value').trim();
    const name = chance.string({ pool: 'wqertyuiopasdfghjklzxcvbnml' });
    callback(null, {
      csrf,
      domain,
      name,
    });
  });
}