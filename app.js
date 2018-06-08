const Chance = require('chance');
const request = require('request');
const cheerio = require('cheerio');
const program = require('commander');
const chance = new Chance();
const promisify = require('./utils/promisify');
const TaskQueue = require('./utils/taskQueue');
const package = require('./package.json');

let l;
const REGIST_URL = 'https://www.processon.com/signup/submit';
const TEMP_MAIL_CHANGE_URL = 'https://temp-mail.org/zh/option/change/';
const TEMP_MAIL_REFRESH_URL = 'https://temp-mail.org/zh/option/refresh/';

let getCookie = require('./steps/getCookie');
let registAccount = require('./steps/registAccount');
let getTempEmailArgs = require('./steps/getTempEmailArgs');
let getNewEmail = require('./steps/getNewEmail');
let intervalGetEmail = require('./steps/intervalGetEmail');
let clickSuccessRegistProcesson = require('./steps/clickSuccessRegistProcesson');

let times = 0;

getCookie = promisify(getCookie);
registAccount = promisify(registAccount);
getTempEmailArgs = promisify(getTempEmailArgs);
getNewEmail = promisify(getNewEmail);
intervalGetEmail = promisify(intervalGetEmail);
clickSuccessRegistProcesson = promisify(clickSuccessRegistProcesson);

function task(callback) {
  let jar = request.jar();
  getTempEmailArgs(TEMP_MAIL_CHANGE_URL, jar)
    .then(({ csrf, domain, name }) => getNewEmail({
      uri: TEMP_MAIL_CHANGE_URL,
      csrf,
      domain,
      mail: name,
      jar,
    }))
    .then((email) => getCookie({ url: l, jar, email }))
    .then((email) => {
      const password = chance.string();
      const username = chance.string();
      return registAccount({
        jar,
        email,
        password,
        username,
        uri: REGIST_URL,
      });
    })
    .then(() => intervalGetEmail({ jar, uri: TEMP_MAIL_REFRESH_URL }))
    .then(processonEmailUrl => clickSuccessRegistProcesson(processonEmailUrl))
    .then(() => {
      callback();
      console.log(`success ${++times} times.`);
    })
    .catch((err) => {
      console.error(err);
    });
}

program
  .version(package.version)
  .usage(`\r\n  ${package.description}\r\n  Github: ${package.author}\r\n  Repository: ${package.repository.url}`)
  .option('-v, --version', 'output the version number.')
  .option('-c, --concurrency <n>', 'set your concurrency, default is 5.', parseInt)
  .option('-t, --times <n>', 'set your times which is resolved, default is 15, so that add 45 files to your processon.', parseInt)
  .option('-l, --link <s>', 'set your link find on https://www.processon.com/setting.')
  .parse(process.argv);

if (!program.link) {
  console.log('please set your link, you can set it on https://www.processon.com/setting.')
} else {
  let c = program.concurrency > 0 ? program.concurrency : 5;
  let t = program.concurrency > 0 ? program.times : 15;
  l = program.link;
  const taskQueue = new TaskQueue(c);
  for (let i = 0; i < t; i++) {
    taskQueue.pushTask(task);
  }
}
