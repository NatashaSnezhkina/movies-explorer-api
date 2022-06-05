require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { celebrate, Joi, errors } = require('celebrate');
const auth = require('./middlewares/auth');
const error = require('./middlewares/error');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const {
  login,
  createUser,
} = require('./controllers/users');
// const NotFoundError = require('./errors/404-error');

const { PORT = 3000 } = process.env;
const app = express();
mongoose.connect('mongodb://localhost:27017/bitfilmsdb');
app.use(requestLogger);
app.use(bodyParser.json()); // для собирания JSON-формата
app.use(bodyParser.urlencoded({ extended: true })); // для приёма веб-страниц внутри POST-запроса
app.use(helmet());
app.use(cookieParser());

app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), createUser);

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);

app.use('/users', auth, require('./routes/users'));
app.use('/movies', auth, require('./routes/movies'));

// app.all('*', auth, () => {
//   throw new NotFoundError('Ошибка 404. Страница не найдена');
// });

app.use(errorLogger);
app.use(errors());
app.use(error);

app.listen(PORT);
