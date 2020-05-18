const Author = require('../models/author');
const Book = require('../models/book');
const async = require('async');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Show all autors
exports.author_list = (req, res, next) => {
  Author
    .find()
    .sort([['family_name', 'ascending']])
    .exec((err, author_list) => {
      if (err) return next(err);

      res.render('author_list', { title: 'Author list', author_list });
    });
};

// Show author detail
exports.author_detail = (req, res, next) => {
  async.parallel({
    author: (callback) => {
      Author.findById(req.params.id).exec(callback);
    },
    author_books: (callback) => {
      Book.find({ 'author': req.params.id }, 'title summary')
        .exec(callback);
    },
  }, (err, results) => {
    if (err) return next(err);

    if (results.author === null) {
      let err = new Error('Author not found');
      err.status = 404;
      return next(err);
    }

    res.render(
      'author_detail',
      {
        title: 'Author Detail',
        author: results.author,
        author_books: results.author_books,
      },
    );
  });
};

// Show creation form - get
exports.author_create_get = (req, res) => {
  res.render('author_form', { title: 'Create Author' });
};

// Create Author - post
exports.author_create_post = (req, res) => [
  // Validation
  body('first_name').isLength({ min: 1 }).trim()
    .withMessage('First name must be specified.')
    .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
  body('family_name').isLength({ min: 1 }).trim()
    .withMessage('Family name must be specified.')
    .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
  body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601(),
  body('date_of_death', 'Invalid date of death').optional({ checkFalsy: true }).isISO8601(),

  // Sanitize
  sanitizeBody('first_name').escape(),
  sanitizeBody('family_name').escape(),
  sanitizeBody('date_of_birth').toDate(),
  sanitizeBody('date_of_death').toDate(),

  // Process
  (req, res, next) => {
    // Extract errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render(
        'author_form',
        {
          title: 'Create Author',
          author: req.body,
          errors: errors.array(),
        },
      );

      return;
    }

    const author = new Author(
      {
        first_name: req.body.first_name,
        family_name: req.body.family_name,
        date_of_birth: req.body.date_of_birth,
        date_of_death: req.body.date_of_death,
      }
    );

    author.save((err) => {
      if (err) return next(err);

      res.redirect(author.url);
    });
  }
];

// Show removing form - get
exports.author_delete_get = (req, res) => {
  res.send('NOT IMPLEMENTED: Author delete GET');
};

// Remove author - post
exports.author_delete_post = (req, res) => {
  res.send('NOT IMPLEMENTED: Author delete POST');
};

// Show update form
exports.author_update_get = (req, res) => {
  res.send('NOT IMPLEMENTED: Author update GET');
};

// Update author
exports.author_update_post = (req, res) => {
  res.send('NOT IMPLEMENTED: Author update POST');
};
