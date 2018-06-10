var Evernote = require('evernote');
var moment = require('moment');
const momentTimezone = require('moment-timezone');

var calendarEvents = [];

var config = require('../config.json');

// var callbackUrl = "http://localhost:5000/oauth_callback";
var callbackUrl = "https://everyday-journal-evernote.herokuapp.com/oauth_callback"

// home page
exports.index = function(req, res) {

console.log('index');
  if (req.session.oauthAccessToken) {
    console.log('index request..', req.session.oauthAccessToken);

    var token = req.session.oauthAccessToken;
    var client = new Evernote.Client({
      token: token,
      // sandbox: config.SANDBOX,
      sandbox: false,
      china: config.CHINA
    });
    client.getNoteStore().listNotebooks().then(function(notebooks) {
      req.session.notebooks = notebooks;
      // console.log(req.session)
      let guid = notebooks[0].guid;
      // console.log(guid);

      let noteBody1 = `


      <div><b>Goal for this quarter :</b></div>
      <div><b>Start a blog. Get famous. </b></div>

      <br/>
      <br/>

      <div><b>What are the goals for today? </b></div>
      <div style="padding-left: 15px">`;

        let noteBody2 = `
      </div>
      <div><b>What was significant today? </b></div>
      <div style="padding-left: 15px">
        <ol>
          <li> <en-todo/>
          </li>
        </ol>
      </div>

      <br/>
      <br/>
      <div><b>What did I learn today? </b></div>

      <div style="padding-left: 15px">
        <ol>
          <li> <en-todo/>
          </li>
        </ol>
      </div>

      <br/>
      <br/>
      <div><b>What am I grateful for today? </b></div>
      <div style="padding-left: 15px">
        <ol>
          <li> <en-todo/>
          </li>
        </ol>
      </div>

      <br/>
      <br/>
      <div><b>What is the goal for tomorrow? </b></div>
      <div style="padding-left: 15px">
        <ol>
          <li> <en-todo/>
          </li>
        </ol>
      </div>

      <br/>
      <br/>
      <div><b>Random Thoughts</b></div>

      `;

      let events = calendarEvents.reduce((e, event, index) => {
        return `${e} <li> <en-todo/>${event}</li>`;
      }, '<ol>') + `</ol>`;

      let noteBody = `${noteBody1} ${events} ${noteBody2}`;

      const date = new Date();

      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

      let title = "Day "+ date.getDate() +" of " + monthNames[date.getMonth()] + ", " + date.getFullYear();
      makeNote(client.getNoteStore(), title, noteBody, {guid} );
      res.render('index', {session: req.session});

    }, function(error) {
      console.log('index request error callback..');
      req.session.error = JSON.stringify(error);
      res.render('index', {session: req.session});
    });
  } else {
    console.log('index request else..', req.session.oauthAccessToken);
    res.render('index', {session: req.session});
  }
};

// OAuth
exports.oauth = function(req, res) {
  var client = new Evernote.Client({
    consumerKey: config.API_CONSUMER_KEY,
    consumerSecret: config.API_CONSUMER_SECRET,
    // sandbox: config.SANDBOX,

    sandbox: false,
    china: config.CHINA
  });

  client.getRequestToken(callbackUrl, function(error, oauthToken, oauthTokenSecret, results) {
    if (error) {
      req.session.error = JSON.stringify(error);
      res.redirect('/');
    } else {
      // store the tokens in the session
      req.session.oauthToken = oauthToken;
      req.session.oauthTokenSecret = oauthTokenSecret;

      // redirect the user to authorize the token
      res.redirect(client.getAuthorizeUrl(oauthToken));
    }
  });
};

// OAuth callback
exports.oauth_callback = function(req, res) {
  var client = new Evernote.Client({
    consumerKey: config.API_CONSUMER_KEY,
    consumerSecret: config.API_CONSUMER_SECRET,
    // sandbox: config.SANDBOX,
    sandbox: false,
    china: config.CHINA
  });

  client.getAccessToken(
    req.session.oauthToken,
    req.session.oauthTokenSecret,
    req.query.oauth_verifier,
    function(error, oauthAccessToken, oauthAccessTokenSecret, results) {
      if (error) {
        console.log('error');
        console.log(error);
        res.redirect('/');
      } else {
        // store the access token in the session
        req.session.oauthAccessToken = oauthAccessToken;
        req.session.oauthAccessTokenSecret = oauthAccessTokenSecret;
        req.session.edamShard = results.edam_shard;
        req.session.edamUserId = results.edam_userId;
        req.session.edamExpires = results.edam_expires;
        req.session.edamNoteStoreUrl = results.edam_noteStoreUrl;
        req.session.edamWebApiUrlPrefix = results.edam_webApiUrlPrefix;
        res.redirect('/');
      }
  });
};

// Clear session
exports.clear = function(req, res) {
  req.session.destroy();
  res.redirect('/');
};

exports.createNote = function(req, res) {
  getTodayEvents(req, res, createNoteCallback );
  console.log('createNote..method');
}

exports.buttonCreate = function(req, res) {
  makeRequest();
}

function makeRequest() {
  var http = require("https");

  var options = {
    "method": "GET",
    "hostname": "everyday-journal-evernote.herokuapp.com",
    "port": null,
    "path": "/createNote",
    "headers": {
      "upgrade-insecure-requests": "1",
      "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36",
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
      "accept-encoding": "gzip, deflate, br",
      "accept-language": "en-US,en;q=0.9",
      "cookie": "connect.sid=s%3AwB8Z51lp20CptfL92OO3ZvEMcgm00-W2.jNoL7CCX50SOZ7TiRC1JKxrQne5ito18ntJXZ%2BdVPE4",
      "cache-control": "no-cache",
      "postman-token": "8015893f-052b-0f50-7f73-8c736de69b00"
    }
  };

  var req = http.request(options, function (res) {
    var chunks = [];

    res.on("data", function (chunk) {
      chunks.push(chunk);
    });

    res.on("end", function () {
      var body = Buffer.concat(chunks);
      console.log(body.toString());
    });
  });

  req.end();

}
// "evernote": "^2.0.0-beta",
function createNoteCallback(req, res) {
let tokenHardCode = process.env.evernote_access_token;
  if (tokenHardCode) {
    var token = tokenHardCode;
    var client = new Evernote.Client({
      token: token,
      // sandbox: config.SANDBOX,
      sandbox: false,
      china: config.CHINA
    });
    client.getNoteStore().listNotebooks().then(function(notebooks) {
      req.session.notebooks = notebooks;
      // console.log(req.session)
      let guid = notebooks[0].guid;
      // console.log(guid);

      let noteBody1 = `


      <div><b>Goal for this quarter :</b></div>
      <div><b>Start a blog. Get famous. </b></div>

      <br/>
      <br/>

      <div><b>What are the goals for today? </b></div>
      <div style="padding-left: 15px">`;

        let noteBody2 = `
      </div>
      <div><b>What was significant today? </b></div>
      <div style="padding-left: 15px">
        <ol>
          <li> <en-todo/>
          </li>
        </ol>
      </div>

      <br/>
      <br/>
      <div><b>What did I learn today? </b></div>

      <div style="padding-left: 15px">
        <ol>
          <li> <en-todo/>
          </li>
        </ol>
      </div>

      <br/>
      <br/>
      <div><b>What am I grateful for today? </b></div>
      <div style="padding-left: 15px">
        <ol>
          <li> <en-todo/>
          </li>
        </ol>
      </div>

      <br/>
      <br/>
      <div><b>What is the goal for tomorrow? </b></div>
      <div style="padding-left: 15px">
        <ol>
          <li> <en-todo/>
          </li>
        </ol>
      </div>

      <br/>
      <br/>
      <div><b>Random Thoughts</b></div>

      `;

      let events = calendarEvents.reduce((e, event, index) => {
        return `${e} <li> <en-todo/>${event}</li>`;
      }, '<ol>') + `</ol>`;

      let noteBody = `${noteBody1} ${events} ${noteBody2}`;

      const date = new Date();

      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

      let title = "Day "+ date.getDate() +" of " + monthNames[date.getMonth()] + ", " + date.getFullYear();
      makeNote(client.getNoteStore(), title, noteBody, {guid} );

      // req.session.notebooks = notebooks;
      // console.log(req.session)
      res.render('index', {session: req.session});
    }, function(error) {
      req.session.error = JSON.stringify(error);
      res.render('index', {session: req.session});
    });
  } else {
    res.render('index', {session: req.session});
  }
}

function makeNote(noteStore, noteTitle, noteBody, parentNotebook) {
  var nBody = '<?xml version="1.0" encoding="UTF-8"?>';
  nBody += '<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">';
  nBody += "<en-note>" + noteBody + "</en-note>";

  // Create note object
  var ourNote = new Evernote.Types.Note();
  ourNote.title = noteTitle;
  ourNote.content = nBody;

  // parentNotebook is optional; if omitted, default notebook is used
  if (parentNotebook && parentNotebook.guid) {
    ourNote.notebookGuid = parentNotebook.guid;
  }

  // Attempt to create note in Evernote account (returns a Promise)
  noteStore.createNote(ourNote)
    .then(function(note) {
      // Do something with `note`
      console.log(' create note');
    }).catch(function (err) {
      // Something was wrong with the note data
      // See EDAMErrorCode enumeration for error code explanation
      // http://dev.evernote.com/documentation/reference/Errors.html#Enum_EDAMErrorCode
      console.log(err);
    });
}

exports.getNote = function () {
  if (req.session.oauthAccessToken) {
    var token = req.session.oauthAccessToken;
    var client = new Evernote.Client({
      token: token,
      // sandbox: config.SANDBOX,
      sandbox: false,
      china: config.CHINA
    });

    client.getNoteStore().listNotebooks().then(function(notebooks) {
      req.session.notebooks = notebooks;
      // console.log(req.session)
      let guid = notebooks[0].guid;


      client.getNoteStore().getNote('', guid, true, true).then((note) => {
        req.session.note = note;
        res.render('index', {session: req.session});
      })

    }, function(error) {
      req.session.error = JSON.stringify(error);
      res.render('index', {session: req.session});
    });


  } else {
    res.render('index', {session: req.session});
  }

}


/* Calendar methods */

const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

// If modifying these scopes, delete credentials.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const TOKEN_PATH = 'credentials.json';

function getTodayEvents(req, res, callback) {
  // Load client secrets from a local file.
  try {
    const content = fs.readFileSync('client_secret.json');
    authorize(JSON.parse(content), listEvents, req, res, createNoteCallback);
  } catch (err) {
    return console.log('Error loading client secret file:', err);
  }
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 * @return {function} if error in reading credentials.json asks for a new one.
 */
function authorize(credentials, callback, req, res, createNoteCallback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  let token = {};
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  try {
    token = fs.readFileSync(TOKEN_PATH);
    token = JSON.parse(token)
  } catch (err) {

    token = {
      "access_token": process.env.access_token,
      "token_type": "Bearer",
      "refresh_token": process.env.refresh_token,
      "expiry_date": process.env.expiry_date
    }

    // return getAccessToken(oAuth2Client, callback);
  }
  oAuth2Client.setCredentials(token);
  callback(oAuth2Client, req, res, createNoteCallback);
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return callback(err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      try {
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
        console.log('Token stored to', TOKEN_PATH);
      } catch (err) {
        console.error(err);
      }
      callback(oAuth2Client);
    });
  });
}

/**
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listEvents(auth, req, res, createNoteCallback) {
  const calendar = google.calendar({version: 'v3', auth});

  let fromDate = new Date();
  fromDate.setHours(0);

  let toDate = new Date();
  toDate.setHours(24);

  calendar.events.list({
    calendarId: 'primary',
    timeMin: fromDate.toISOString(),
    timeMax: toDate.toISOString(),
    // maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime',
  }, (err, {data}) => {
    if (err) return console.log('The API returned an error: ' + err);
    const events = data.items;
    if (events.length) {
      console.log('Events for the day:');
      try {
        calendarEvents = events.map((event, i) => {
          let  start = event.start.dateTime || event.start.date;
          start = new Date(start);

           start.getHours().toString().length

          let hours = start.getHours();
          let minutes = start.getMinutes();

          let startTime = moment(start).tz('Asia/Colombo').format('LT');

          hours = hours.toString().length > 1 ? hours : '0' + hours;
          minutes = minutes.toString().length > 1 ? minutes : '0' + minutes;

          console.log(`${startTime} - ${event.summary} - ${hours} : ${minutes}`);
          return `${event.summary} - ${startTime}`;
        });

      } catch (e) {
        console.log(e);
      }

      createNoteCallback(req, res);
    } else {
      console.log('No upcoming events found.');
      createNoteCallback(req, res);
    }
  });
}
