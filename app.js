var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const jwtAuth = require('./lib/jwtAuth')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//app.use('/', indexRouter);
//app.use('/users', usersRouter);
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Methods", "PUT");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "DELETE ,PUT");
  next();
});
/**
 * Rutas del API
 */
//app.post('/api/loginJWT',   loginController.postJWT);
//app.use('/apiv1/login', require('./routes/apiv1/login'));
app.use('/apiv1/users', require('./routes/apiv1/users'));
app.use('/apiv1/adverts', require('./routes/apiv1/adverts'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
/*
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
*/
// error handler
app.use(function (err, req, res, next) {
  if (err.array) { // validation error
    err.status = 422
    const errInfo = err.array({ onlyFirstError: true })[0]
    err.message = isAPI(req)
      ? { message: __('not_valid'), errors: err.mapped() }
      : `${__('not_valid')} - ${errInfo.param} ${errInfo.msg}`
  }

  // establezco el status a la respuesta
  err.status = err.status || 500
  res.status(err.status)

  // si es un 500 lo pinto en el log
  if (err.status && err.status >= 500) console.error(err)

  // si es una petición al API respondo JSON...
  if (isAPI(req)) {
    //console.log("API**************************")
    res.json({ ok: false, reason: err.message })
    return
  }

  // ...y si no respondo con HTML...

  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.render('error')
})

function isAPI(req) {
  return req.originalUrl.indexOf('/api') === 0
}
module.exports = app;
