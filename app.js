require('module-alias/register')
require('@models/order-model')
require('@models/comment-model')
require('@models/product-model')
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var Joi = require('./validate-data')
var app = express();
var HttpStatus = require('http-status-codes')
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(require('./routes'));

app.use(function(req, res, next) {
  res.status(HttpStatus.NOT_FOUND).send({ status: HttpStatus.NOT_FOUND, data:[], 'msg': 'Not Found' })
});

// error handler
app.use(function(err, req, res, next) {
  res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ status: HttpStatus.INTERNAL_SERVER_ERROR, data:[], 'msg': 'Internal Server Error' })
});
const port = process.env.PORT || 3030;
module.exports = app;
app.listen(port, () => console.log(`Example app listening on port ${port}!`))

