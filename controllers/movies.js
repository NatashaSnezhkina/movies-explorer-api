const Movie = require('../models/movie');
const NotFoundError = require('../errors/404-error');
const IncorrectDataError = require('../errors/400-error');
const ForbiddenError = require('../errors/403-error');

module.exports.getMovies = (req, res, next) => {
  Movie.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(next);
};

module.exports.createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    // movieId,
  } = req.body;

  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    owner: req.user._id,
  })
    .then((movie) => res.send({
      country: movie.country,
      director: movie.director,
      duration: movie.duration,
      year: movie.year,
      description: movie.description,
      image: movie.image,
      trailerLink: movie.trailerLink,
      nameRU: movie.nameRU,
      nameEN: movie.nameEN,
      thumbnail: movie.thumbnail,
      movieId: movie.id,
      owner: movie.owner,
      createdAt: movie.createdAt,
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new IncorrectDataError('Переданы некорректные данные при создании карточки'));
      }
      next(err);
    });
};

module.exports.deleteMovie = (req, res, next) => {
  const userId = req.user._id;

  Movie.findById(req.params.movieId)
    .orFail(() => {
      throw new NotFoundError('Карточка не найдена');
    })
    .then((movie) => {
      if (userId !== movie.owner.toString()) {
        throw new ForbiddenError('Вы не можете удалять чужие карточки');
      }

      Movie.findByIdAndRemove(req.params.movieId)
        .then((deletedMovie) => {
          res.send({
            country: deletedMovie.country,
            director: deletedMovie.director,
            duration: deletedMovie.duration,
            year: deletedMovie.year,
            description: deletedMovie.description,
            image: deletedMovie.image,
            trailerLink: deletedMovie.trailerLink,
            nameRU: deletedMovie.nameRU,
            nameEN: deletedMovie.nameEN,
            thumbnail: deletedMovie.thumbnail,
            movieId: deletedMovie.id,
            owner: deletedMovie.owner,
            createdAt: deletedMovie.createdAt,
          });
        })
        .catch(next);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new IncorrectDataError('Переданы некорректные данные при удалении карточки'));
      }
      next(err);
    });
};
