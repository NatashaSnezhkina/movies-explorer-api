require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');
const error = require('./middlewares/error');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const router = require('./routes');
// const cors = require('./middlewares/cors');

const { PORT = 3000, NODE_ENV, DB_URL } = process.env;
const app = express();
mongoose.connect(`${NODE_ENV === 'production' ? DB_URL : 'mongodb://localhost:27017/bitfilmsdb'}`);

const allowedCors = [
  'localhost:3000',
  'https://diploma.natasha.snezh.nomoredomains.xyz',
  'http://diploma.natasha.snezh.nomoredomains.xyz',
  'https://praktikum.tk',
  'http://praktikum.tk',
];

app.use(requestLogger);
app.use(bodyParser.json()); // для собирания JSON-формата
app.use(bodyParser.urlencoded({ extended: true })); // для приёма веб-страниц внутри POST-запроса
app.use(helmet());
app.use(cookieParser());
app.use(router);
app.use(errorLogger);
app.use(errors());
app.use(error);

app.use((req, res, next) => {
  const { origin } = req.headers; // Сохраняем источник запроса в переменную origin
  // проверяем, что источник запроса есть среди разрешённых
  const { methodHttp } = req; // Сохраняем тип запроса (HTTP-метод) в соответствующую переменную
  const requestHeaders = req.headers['access-control-request-headers'];
  const DEFAULT_ALLOWED_METHODS = 'GET,HEAD,PUT,PATCH,POST,DELETE';
  if (allowedCors.includes(origin)) {
    // устанавливаем заголовок, который разрешает браузеру запросы с этого источника
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  if (methodHttp === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', DEFAULT_ALLOWED_METHODS);
    res.header('Access-Control-Allow-Headers', requestHeaders);
    return res.end();
  }
  return next();
});
app.listen(PORT);
