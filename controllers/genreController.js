var Genre = require('../models/genre');
var Book = require('../models/book');
var async = require('async');
const { body, validationResult } = require("express-validator");

// Display list of all Genre.
exports.genre_list = (req, res) => {
    Genre.find()
        .sort([['name', 'ascending']])
        .exec((err, list_genres) => {
            if (err) return next(err);
            else res.render('genre_list', { title: 'Genre List', genre_list: list_genres });
        });
};

// Display detail page for a specific Genre.
exports.genre_detail = function(req, res, next) {
    async.parallel({
        genre: function(callback) {
            Genre.findById(req.params.id).exec(callback);
        },

        genre_books: function(callback) {
            Book.find({ 'genre': req.params.id })
              .exec(callback);
        },

    }, function(err, results) {
        if (err) { return next(err); }
        if (results.genre === null) { // No results.
            var err = new Error('Genre not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render
        res.render('genre_detail', { title: 'Genre Detail', genre: results.genre, genre_books: results.genre_books } );
    });
};

// Display Genre create form on GET.
exports.genre_create_get = function(req, res, next) {
    res.render('genre_form', { title: 'Create Genre' });
}

// Handle Genre create on POST.
exports.genre_create_post =  [
    // Validate and santize the name field.
    body('name', 'Genre name required').trim().isLength({ min: 1 }).escape(),
  
    // Process request after validation and sanitization.
    (req, res, next) => {
      // Extract the validation errors from a request.
      const errors = validationResult(req);
  
      // Create a genre object with escaped and trimmed data.
      var genre = new Genre(
        { name: req.body.name }
      );
  
      if (!errors.isEmpty()) {
        // There are errors. Render the form again with sanitized values/error messages.
        res.render('genre_form', { title: 'Create Genre', genre: genre, errors: errors.array()});
        return;
      }
      else {
        // Data from form is valid.
        // Check if Genre with same name already exists.
        Genre.findOne({ 'name': req.body.name })
          .exec( function(err, found_genre) {
             if (err) { return next(err); }

             if (found_genre) {
               // Genre exists, redirect to its detail page.
               res.redirect(found_genre.url);
             }
             else {
               genre.save(function (err) {
                 if (err) { return next(err); }
                 // Genre saved. Redirect to genre detail page.
                 res.redirect(genre.url);
               });
             }
           });
      }
    }
  ];

// Display Genre delete form on GET.
exports.genre_delete_get = (req, res, next) => {
    async.parallel({
        genre: function(callback) {
            Genre.findById(req.params.id).exec(callback);
        },
        genre_books: function(callback) {
            Book.find({ genre: req.params.id }).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.genre === null) {
            res.redirect('/catalog/genres');
        }
        res.render('genre_delete', { title: 'Delete Genre', genre: results.genre, genre_books: results.genre_books });
    });
};

// Handle Genre delete on POST.
exports.genre_delete_post = (req, res, next) => {
    async.parallel({
        genre: function(callback) {
            Genre.findById(req.body.genreid).exec(callback);
        },
        genre_books: function(callback) {
            Book.find({ 'genre': req.body.genreid }).exec(callback);
        },
     }, function(err, results) {
            if (err) { return next(err); }
            if (results.genre_books.length > 0) {
                res.render('genre_delete', { title: 'Delete Genre', genre: results.genre, genre_books: results.genre_books });
                return;
            }
            else {
                Genre.findByIdAndRemove(req.body.genreid, function(err) {
                    if (err) { return next(err); }
                    res.redirect('/catalog/genres');
                })
            }
        }        
    )
};

// Display Genre update form on GET.
exports.genre_update_get = (req, res, next) => {
    Genre.findById(req.params.id, function(err, result) {
        if (err) { return next(err); }
        if (result === null) {
            var err = new Error('Book not found');
            err.status = 404;
            return next(err);            
        }

        res.render('genre_form', { title: 'Update Genre', genre: result });
    });
};

// Handle Genre update on POST.
exports.genre_update_post = [
    body('name', 'Genre must not be empty.').trim().isLength({ min: 1 }).escape(),
    (req, res, next) => {
        const errors = validationResult(req);

        var genre = new Genre(
            { name: req.body.name,
              _id:req.params.id //This is required, or a new ID will be assigned!
            });

        if (!errors.isEmpty()) {
            Genre.findById(req.params.id, function(err, result) {
                if (err) { return next(err); }
                if (result === null) {
                    var err = new Error('Genre not found');
                    err.status = 404;
                    return next(err);            
                }
                
                res.render('genre_form', { title: 'Update Genre', genre: result });
            });
            return;
        }
        else {
            Genre.findByIdAndUpdate(req.params.id, genre, {}, function(err, thegenre) {
                if (err) { return next(err); }
                res.redirect(thegenre.url);
            })
        }
    }
];
