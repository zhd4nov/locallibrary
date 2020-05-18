const Book = require('../models/book');
const Author = require('../models/author');
const Genre = require('../models/genre');
const BookInstance = require('../models/bookinstance');

const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

const async = require('async');
exports.index = (req, res) => {
  async.parallel({
    book_count: (callback) => {
      Book.count({}, callback);
    },
    book_instance_count: (callback) => {
      BookInstance.count({}, callback);
    },
    book_instance_available_count: (callback) => {
      BookInstance.count({ status: 'Available' }, callback);
    },
    author_count: (callback) => {
      Author.count({}, callback);
    },
    genre_count: (callback) => {
      Genre.count({}, callback);
    },
  }, (err, results) => {
    res.render('index', { title: 'Local Library Home', error: err, data: results });
  });
};

// Display list of all books.
exports.book_list = (req, res) => {
  Book
    .find({}, 'title author')
    .populate('author')
    .exec((err, book_list) => {
      if (err) return next(err);
      res.render('book_list', { title: 'Book list', book_list });
    });
};

// Display detail page for a specific book.
exports.book_detail = (req, res, next) => {
  async.parallel({
    book: (callback) => {
      Book.findById(req.params.id)
        .populate('author')
        .populate('genre')
        .exec(callback);
    },
    book_instance: (callback) => {
      BookInstance.find({ 'book': req.params.id }).exec(callback);
    },
  }, (err, results) => {
    if (err) { return next(err); }
    if (results.book == null) { // No results.
      const err = new Error('Book not found');
      err.status = 404;
      return next(err);
    }
    // Success:
    res.render(
      'book_detail',
      {
        title: results.book.title,
        book: results.book,
        book_instances: results.book_instance
      }
    );
  });
};

// Display book create form on GET.
exports.book_create_get = (req, res) => {
  async.parallel({
    authors: (callback) => {
      Author.find(callback);
    },
    genres: (callback) => {
      Genre.find(callback);
    },
  }, (err, results) => {
    if (err) return next(err);
    res.render(
      'book_form',
      { title: 'Create Book', authors: results.authors, genres: results.genres },
    );
  });
};

// Handle book create on POST.
exports.book_create_post = [
  // Convert the genre to an array.
  (req, res, next) => {
    if (!(req.body.genre instanceof Array)) {
      if (typeof req.body.genre === 'undefined')
        req.body.genre = [];
      else
        req.body.genre = new Array(req.body.genre);
    }
    next();
  },

  // Validate fields.
  body('title', 'Title must not be empty.').trim().isLength({ min: 1 }),
  body('author', 'Author must not be empty.').trim().isLength({ min: 1 }),
  body('summary', 'Summary must not be empty.').trim().isLength({ min: 1 }),
  body('isbn', 'ISBN must not be empty').trim().isLength({ min: 1 }),

  // Sanitize fields (using wildcard).
  sanitizeBody('*').escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {

    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Book object with escaped and trimmed data.
    const book = new Book(
      {
        title: req.body.title,
        author: req.body.author,
        summary: req.body.summary,
        isbn: req.body.isbn,
        genre: req.body.genre
      });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors and genres for form.
      async.parallel({
        authors: function (callback) {
          Author.find(callback);
        },
        genres: function (callback) {
          Genre.find(callback);
        },
      }, function (err, results) {
        if (err) return next(err);

        // Mark our selected genres as checked.
        for (let i = 0; i < results.genres.length; i++) {
          if (book.genre.indexOf(results.genres[i]._id) > -1) {
            results.genres[i].checked = 'true';
          }
        }
        res.render('book_form', { title: 'Create Book', authors: results.authors, genres: results.genres, book: book, errors: errors.array() });
      });
      return;
    }
    else {
      // Data from form is valid. Save book.
      book.save(function (err) {
        if (err) { return next(err); }
        //successful - redirect to new book record.
        res.redirect(book.url);
      });
    }
  }
];

// Display book delete form on GET.
exports.book_delete_get = (req, res) => {
  res.send('NOT IMPLEMENTED: Book delete GET');
};

// Handle book delete on POST.
exports.book_delete_post = (req, res) => {
  res.send('NOT IMPLEMENTED: Book delete POST');
};

// Display book update form on GET.
exports.book_update_get = (req, res) => {
  res.send('NOT IMPLEMENTED: Book update GET');
};

// Handle book update on POST.
exports.book_update_post = (req, res) => {
  res.send('NOT IMPLEMENTED: Book update POST');
};
