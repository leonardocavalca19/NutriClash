var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const fs = require("fs");
const session = require("express-session");
const seedDatabase = require("./db/seed");

if(!fs.existsSync("db/database.js"))
{
  console.log("Database non trovato. Creazione database");
  seedDatabase();
}
else
{
  console.log("Database trovato");
}

const hostname = '127.0.0.1';
const port = 3000;

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var registratiRouter = require('./routes/registrati');
var loginRouter = require('./routes/login');
var nutriscoreRouter = require('./routes/nutriscore');
var gameRouter = require('./routes/game');
var scontroRouter = require('./routes/scontro');
var obiettivoRouter = require('./routes/obiettivo');
var contattiRouter = require('./routes/contatti');
var privacyRouter = require('./routes/privacy');
var accountRouter = require('./routes/account');


var app = express();

app.use(session({
    secret: 'supersegreto',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

app.use(function(req, res, next) {
  
  res.locals.user = req.session.user || null; // Questo rende la variabile "user" disponibile in tutti i file .ejs
  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/registrati', registratiRouter);
app.use('/login', loginRouter);
app.use('/game', gameRouter);
app.use('/nutriscore', nutriscoreRouter);
app.use('/scontro', scontroRouter);
app.use('/obiettivo', obiettivoRouter);
app.use('/contatti', contattiRouter);
app.use('/privacy', privacyRouter);
app.use('/account', accountRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


var server = app.listen(port, hostname, () => {
  console.log(`Server in esecuzione su http://${hostname}:${port}/`);
});

module.exports = app;