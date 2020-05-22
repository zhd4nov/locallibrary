const BookInstance = require('../models/bookinstance');
const Book = require('../models/book');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const async = require('async');

// Display list of all BookInstances.
exports.bookinstance_list = (req, res) => {
  BookInstance
    .find()
    .populate('book')
    .exec((err, bookinstance_list) => {
      if (err) return next(err);
      res.render('bookinstance_list', { title: 'Book Instance List', bookinstance_list });
    });
};

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = (req, res, next) => {
  BookInstance.findById(req.params.id)
    .populate('book')
    .exec((err, bookinstance) => {
      if (err) return next(err);

      if (bookinstance === null) {
        let err = new Error('Book copy not found')
        err.status = 404;
        return next(err);
      }
      res.render(
        'bookinstance_detail',
        { title: `Copy: ${bookinstance.book.title}`, bookinstance },
      );
    });
};

// Display BookInstance create form on GET.
exports.bookinstance_create_get = (req, res, next) => {
  Book.find({}, 'title')
    .exec((err, books) => {
      if (err) return next(err);

      res.render('bookinstance_form', { title: 'Create BookInstance', books });
    });
};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
  body('book', 'Book must be specified').trim().isLength({ min: 1 }),
  body('imprint', 'Imprint must be specified').trim().isLength({ min: 1 }),
  body('due_back', 'Invalid Date').optional({ checkFalsy: true }).isISO8601(),

  sanitizeBody('book').escape(),
  sanitizeBody('imprint').escape(),
  sanitizeBody('status').trim().escape(),
  sanitizeBody('due_back').toDate(),

  (req, res, next) => {
    const errors = validationResult(req);

    const bookinstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
    });

    if (!errors.isEmpty()) {
      Book.find({}, 'title')
        .exec((err, books) => {
          if (err) return next(err);

          res.render(
            'bookinstance_form',
            {
              title: 'Create Book Instance',
              books,
              selected_book: bookinstance.book._id,
              errors: errors.array(),
              bookinstance,
            }
          );
        });
      return;
    }

    bookinstance.save((err) => {
      if (err) return next(err);

      res.redirect(bookinstance.url);
    });
  },
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = (req, res, next) => {
  BookInstance.findById(req.params.id).exec((err, instance) => {
    if (err) return next(err);

    res.render('bookinstance_delete', { title: 'Delete Copy', instance });
  });
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = (req, res, next) => {
  BookInstance.findByIdAndRemove(req.body.instanceid, (err) => {
    if (err) return next(err);

    res.redirect('/catalog/bookinstances');
  })
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = (req, res, next) => {
  async.parallel({
    bookinstance: function (callback) {
      BookInstance.findById(req.params.id).populate('book').exec(callback)
    },
    books: function (callback) {
      Book.find(callback)
    },

  }, function (err, results) {
    if (err) { return next(err); }
    if (results.bookinstance == null) { // No results.
      const err = new Error('Book copy not found');
      err.status = 404;
      return next(err);
    }
    // Success.
    res.render('bookinstance_form', { title: 'Update  BookInstance', books: results.books, selected_book: results.bookinstance.book._id, bookinstance: results.bookinstance });
  });
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = [

  // Validate fields.
  body('book', 'Book must be specified').isLength({ min: 1 }).trim(),
  body('imprint', 'Imprint must be specified').isLength({ min: 1 }).trim(),
  body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),

  // Sanitize fields.
  sanitizeBody('book').escape(),
  sanitizeBody('imprint').escape(),
  sanitizeBody('status').escape(),
  sanitizeBody('due_back').toDate(),

  // Process request after validation and sanitization.
  (req, res, next) => {

    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a BookInstance object with escaped/trimmed data and current id.
    const bookinstance = new BookInstance(
      {
        book: req.body.book,
        imprint: req.body.imprint,
        status: req.body.status,
        due_back: req.body.due_back,
        _id: req.params.id
      });

    if (!errors.isEmpty()) {
      // There are errors so render the form again, passing sanitized values and errors.
      Book.find({}, 'title')
        .exec(function (err, books) {
          if (err) { return next(err); }
          // Successful, so render.
          res.render('bookinstance_form', { title: 'Update BookInstance', books, selected_book: bookinstance.book._id, errors: errors.array(), bookinstance });
        });
      return;
    }
    else {
      // Data from form is valid.
      BookInstance.findByIdAndUpdate(req.params.id, bookinstance, {}, function (err, thebookinstance) {
        if (err) { return next(err); }
        // Successful - redirect to detail page.
        res.redirect(thebookinstance.url);
      });
    }
  }
];

