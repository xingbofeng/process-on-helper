const Chance = require('chance');
const request = require('request');
const cheerio = require('cheerio');
const chance = new Chance();

module.exports = function intervalGetEmail({ jar, uri }, callback) {
  let timer = null;
  let times = 0;
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
      if ($('.mailListTable tbody tr').length <= 0 && times < 12) {
        console.log('please wait... the processon account is registing.');
        times++;
        timer = setTimeout(intervalGetEmailTimerFunc, 3000);
        return;
      }
      if (times >= 12) {
        return callback(null, '');
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