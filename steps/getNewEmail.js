const Chance = require('chance');
const request = require('request');
const cheerio = require('cheerio');
const chance = new Chance();

module.exports = function getNewEmail({ uri, csrf, domain, mail, jar }, callback) {
  request({
    method: 'POST',
    uri,
    jar,
    form: {
      mail,
      csrf,
      domain,
    }
  }, function(err, response, body) {
    if (err) {
      return callback(err);
    }
    const $ = cheerio.load(body);
    // 如果有alert-success，则证明成功
    if ($('.base .alert-success').length <= 0) {
      return callback(new Error('getNewEmail error, maybe chance name is not success'));
    }
    callback(null, `${mail}${domain}`);
  });
}