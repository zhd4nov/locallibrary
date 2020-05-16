const Author = require('../models/author');

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
exports.author_detail = (req, res) => {
  res.send(`NOT IMPLEMENTED: Author detail: ${req.params.id}`);
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
