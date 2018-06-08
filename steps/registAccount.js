const Chance = require('chance');
const request = require('request');
const cheerio = require('cheerio');
const chance = new Chance();

module.exports = function registAccount({ uri, jar, email, password, username }, callback) {
  request({
    method: 'POST',
    uri,
    jar,
    form: {
      email,
      pass: password,
      fullname: username,
    },
  }, function(err, response, body) {
    if (err) {
      return callback(err);
    }
    console.log(`send email to temp email, email is ${email}, password is ${password}, username is ${username}`);
    callback(null);
  });
}