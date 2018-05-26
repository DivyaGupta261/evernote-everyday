// Module dependencies
var bodyParser = require('body-parser');
var express = require('express');
var expressSession = require('express-session');
var routes = require('./routes');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(expressSession({
  secret: 'supersecretsecret',
  resave: false,
  saveUnititialized: true
}));

// Routes
app.get('/', routes.index);
app.get('/oauth', routes.oauth);
app.get('/oauth_callback', routes.oauth_callback);
app.get('/clear', routes.clear);
app.get('/createNote', routes.createNote);

let port = process.env.PORT || 5000
// Run
app.listen( port, function() {
  console.log('Express server listening on port' + port);
});
// console.log(session)
