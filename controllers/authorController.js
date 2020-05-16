const Author = require('../models/author');
const Book = require('../models/book');
const async = require('async');

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
  res.send('NOT IMPLEMENTED: Author create GET');
};

// Create Author - post
exports.author_create_post = (req, res) => {
  res.send('NOT IMPLEMENTED: Author create POST');
};

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
