const express = require('express');
const router = express.Router();
const Books = require("../models").Books;
const Loans = require("../models").Loans;
const Patrons = require("../models").Patrons;
const moment = require('moment');
const Sequelize = require('sequelize');

const Op = Sequelize.Op;

// Books Router //
router.get('/all_books/', function(req, res, next) {
  let limit = 5; // number of records per page
  let page = req.query.page;
  let offset = limit * (page - 1);
  const filter = req.query.filter;
  //overdue books
  if (filter === 'overdue') {
    Loans.belongsTo(Books, {
      foreignKey: 'book_id'
    });
    //create date
    var date = moment().format('YYYY-MM-DD');
    Loans.findAndCountAll({
      include: [Books],
      where: {
        returned_on: null,
        return_by: {
          [Op.lt]: date
        },
      },
      offset: offset,
      limit: limit
    }).then(function(loans) {
      let pages = Math.ceil(loans.count / limit);
      res.render("books", {
        loans: loans.rows,
        page: page,
        pages: pages,
        filter: filter
      });
    });
  //checked_out books
  } else if (filter === 'checked') {
    Loans.belongsTo(Books, {
      foreignKey: 'book_id'
    });
    Loans.findAndCountAll({
      include: [Books],
      where: {
        returned_on: null,
      },
      offset: offset,
      limit: limit
    }).then(function(loans) {
      let pages = Math.ceil(loans.count / limit);
      res.render("books", {
        loans: loans.rows,
        page: page,
        pages: pages,
        filter: filter
      });
    }).catch(function(err) {
      res.sendStatus(500);
    });
    //get all books
  } else {
    Books.findAndCountAll({
      order: [
        ["first_published", "DESC"]
      ],
      offset: offset,
      limit: limit
    }).then(function(books) {
      let pages = Math.ceil(books.count / limit);
      res.render("books", {
        books: books.rows,
        page: page,
        pages: pages
      });
    });
  }
});

// GET a new book form. //
router.get('/new_book', function(req, res, next) {
  res.render('forms/new_book', {
    book: Books.build()
  });
});

// POST - Create New Book //
router.post('/new_book', function(req, res, next) {
  Books.create(req.body).then(function(book) {
    res.redirect('all_books?page=1');
  }).catch(function(err) {
    if (err.name === "SequelizeValidationError") {
      res.render('forms/new_book', {
        book: Books.build(req.body),
        errors: err.errors
      });
    } else {
      throw err;
    }
  });
});

// GET book details. //
router.get('/:id', function(req, res, next) {
  Books.findByPk(req.params.id).then(function(book) {
    Loans.belongsTo(Books, {
      foreignKey: 'book_id'
    });
    Loans.belongsTo(Patrons, {
      foreignKey: 'patron_id'
    });
    Loans.findAll({
      include: [{
          model: Books,
          required: true
        },
        {
          model: Patrons,
          required: true
        }
      ],
      where: {
        book_id: req.params.id
      }
    }).then(function(data) {
      res.render('books/book_detail', {
        book: book,
        loans: data
      });
    });
  });
});

// POST - Update Book //
router.post('/update_book/:id', function(req, res, next) {

  Books.findById(req.params.id).then(function(book) {
    return book.update(req.body);
  }).then(function() {
    res.redirect('/books/all_books?page=1');
  }).catch(function(err) {
    if (err.name === "SequelizeValidationError") {
      Loans.belongsTo(Books, {
        foreignKey: 'book_id'
      });
      Loans.belongsTo(Patrons, {
        foreignKey: 'patron_id'
      });
      Loans.findAll({
        include: [{
            model: Books,
            required: true
          },
          {
            model: Patrons,
            required: true
          }
        ],
        where: {
          book_id: req.params.id
        }
      }).then(function(data) {

        req.body.id = req.params.id;
        res.render('books/book_detail', {
          book: req.body,
          loans: data,
          errors: err.errors
        });
      }).catch(function(err) {
        res.sendStatus(500);
      });
    } else {
      throw err;
    }
  }).catch(function(err) {
    res.sendStatus(500);
  });
});

// GET return book page
router.get('/return_book/:id', (req, res) => {
  Loans.belongsTo(Books, {
    foreignKey: 'book_id'
  });
  Loans.belongsTo(Patrons, {
    foreignKey: 'patron_id'
  });
  Loans.findAll({
      where: {
        id: req.params.id
      },
      include: [{
          model: Books,
          required: true
        },
        {
          model: Patrons,
          required: true
        }
      ]
    }).then(function(data) {
      res.render('books/return_book', {
        loan: data,
        returned_on: moment().format('YYYY-MM-DD')
      });
    })
    .catch(function(err) {
      res.sendStatus(500);
    });
  console.log(req.params);
});

// POST return book //
router.post('/return_book/:id', (req, res) => {
  Loans.findByPk(req.params.id).then(loan => {
    console.log(req.params);
    loan.update(req.body);
    res.redirect('/loans/all_loans?filter=none&page=1');
  });
});


// POST search results //
router.post('/all_books/search', (req, res) => {
  const searchInput = req.body.searchInput;
  Books.findAll({
      where: {
        [Op.or]: [{
            title: {
              [Op.like]: `%${searchInput}%`
            }
          },
          {
            author: {
              [Op.like]: `%${searchInput}%`
            }
          },
          {
            genre: {
              [Op.like]: `%${searchInput}%`
            }
          },
          {
            first_published: {
              [Op.like]: `%${searchInput}%`
            }
          }
        ]
      }
    })
    .then(books => {
      res.render('books', {
        books: books
      });
    })
    .catch(error => {
      console.log(error);
    });
});

module.exports = router;
