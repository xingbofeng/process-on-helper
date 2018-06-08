const Chance = require('chance');
const request = require('request');
const cheerio = require('cheerio');
const chance = new Chance();

module.exports = function intervalGetEmail({ jar, uri }, callback) {
  let timer = null;
  function intervalGetEmailTimerFunc() {
    request({
      method: 'GET',
      uri,
      jar,
    }, function(err, response, body) {
      if (err) {
        return callback(err);
      }
      const $ = cheerio.load(body);
      if ($('.mailListTable tbody tr').length <= 0) {
        console.log('please wait... the processon account is registing.');
        timer = setTimeout(intervalGetEmailTimerFunc, 1000);
        return;
      }
      const processonEmailUrl = $('.mailListTable tbody tr td a').attr('href');
      console.log(`processonEmailUrl is ${processonEmailUrl}`);
      clearTimeout(timer);
      timer = null;
      callback(null, processonEmailUrl);
    });
  }
  intervalGetEmailTimerFunc();
}