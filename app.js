const Chance = require('chance');
const request = require('request');
const cheerio = require('cheerio');
const chance = new Chance();

const REQUESR_URL = 'https://www.processon.com/i/5b15ff13e4b02e4b26f55930';
const REGIST_URL = 'https://www.processon.com/signup/submit';
const TEMP_MAIL_CHANGE_URL = 'https://temp-mail.org/zh/option/change/';
const TEMP_MAIL_REFRESH_URL = 'https://temp-mail.org/zh/option/refresh/';

function getCookie(url, callback) {
  const jarProcesson = request.jar();
  request({
    method: 'GET',
    uri: url,
    jar: jarProcesson,
  }, function(err, response) {
    if (err) {
      return callback(err);
    }
    callback(null, { jarProcesson });
    // const path = response.req.path;
    // if (!path) {
    //   return callback(new Error(`can't get cookie, please check your url.`));
    // }
    // const cookie = path.match(/(?!=jsessionid=)[0-9A-Z]+(?=\.jvm1)/);
    // if (cookie && cookie[0]) {
    //   const jSessionId = cookie[0];
    //   return callback(null, jSessionId);
    // } else {
    //   return callback(new Error(`can't get cookie, please check your url.`));
    // }
  });
}

function registAccount({ jarProcesson, email, password, username }, callback) {
  // const jar = request.jar();
  // jar.setCookie(request.cookie(`JSESSIONID=${cookie}`), 'https://www.processon.com');
  request({
    method: 'POST',
    uri: REGIST_URL,
    jar: jarProcesson,
    form: {
      email,
      pass: password,
      fullname: username,
    },
  }, function(err, response, body) {
    if (err) {
      return callback(err);
    }
    callback(null, response);
  });
}

function getTempEmailArgs(url, callback) {
  const jar = request.jar();
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
      jar,
    });
  });
}

function getNewEmail({ uri, csrf, domain, mail, jar }, callback) {
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
    callback(null);
  });
}

function intervalGetEmail({ jar, uri }, callback) {
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
        console.log('interval');
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

function clickSuccessRegistProcesson(uri, callback) {
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

function main() {
  let times = 0;
  getTempEmailArgs(TEMP_MAIL_CHANGE_URL, function(err, { csrf, domain, name, jar }) {
    if (err) {
      console.error(err);
      return;
    }
    getNewEmail({
      uri: TEMP_MAIL_CHANGE_URL,
      csrf,
      domain,
      mail: name,
      jar,
    }, function(err) {
      if (err) {
        console.error(err);
        return;
      }
      getCookie(REQUESR_URL, function(err, { jarProcesson }) {
        if (err) {
          console.error(err);
          return;
        }
        const email = `${name}${domain}`;
        const password = chance.string();
        const username = chance.string();
        registAccount({
          jarProcesson,
          email,
          password,
          username,
        }, function (err, response) {
          if (err) {
            console.error(err);
            return;
          }
          console.log(`send email to temp email, email is ${email}, password is ${password}, username is ${username}`);
          intervalGetEmail({
            jar,
            uri: TEMP_MAIL_REFRESH_URL,
          }, function(err, processonEmailUrl) {
            if (err) {
              console.error(err);
              return;
            }
            clickSuccessRegistProcesson(processonEmailUrl, function() {
              console.log(`success ${++times} times.`);
              main();
            });
          });
        });
      });
    });
  });
}

main();
