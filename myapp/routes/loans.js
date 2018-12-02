const express = require('express');
const router = express.Router();
const Books = require("../models").Books;
const Loans = require("../models").Loans;
const Patrons = require("../models").Patrons;
const moment = require('moment');
const Sequelize = require('sequelize');

const Op = Sequelize.Op;

// Loans Router //
router.get('/all_loans', function(req, res, next) {
  let limit = 5; // number of records per page
  let page = req.query.page;
  let offset = limit * (page - 1);
  const filter = req.query.filter;
  //overdue books
  if (filter === 'overdue') {
    var date = moment().format('YYYY-MM-DD');
    Loans.belongsTo(Books, {
      foreignKey: 'book_id'
    });
    Loans.belongsTo(Patrons, {
      foreignKey: 'patron_id'
    });
    Loans.findAndCountAll({
      include: [Books, Patrons],
      where: {
        returned_on: null,
        return_by: {
          [Op.lt]: date
        }
      },
      offset: offset,
      limit: limit,
      order: [
        ["Return_by", "ASC"]
      ]
    }).then(function(loans) {
      let pages = Math.ceil(loans.count / limit);
      res.render("loans", {
        loans: loans.rows,
        page: page,
        pages: pages,
        filter: filter
      });
    }).catch(function(err) {
      res.sendStatus(500);
    });
  //checked_out books
  } else if (filter === 'checked') {
    Loans.belongsTo(Books, {
      foreignKey: 'book_id'
    });
    Loans.belongsTo(Patrons, {
      foreignKey: 'patron_id'
    });
    Loans.findAndCountAll({
      include: [Books, Patrons],
      where: {
        returned_on: null
      },
      offset: offset,
      limit: limit,
      order: [
        ["Return_by", "ASC"]
      ]
    }).then(function(loans) {
      let pages = Math.ceil(loans.count / limit);
      res.render("loans", {
        loans: loans.rows,
        page: page,
        pages: pages,
        filter: filter
      });
    }).catch(function(err) {
      res.sendStatus(500);
    });
    //get all loans
  } else {
    Loans.belongsTo(Books, {
      foreignKey: 'book_id'
    });
    Loans.belongsTo(Patrons, {
      foreignKey: 'patron_id'
    });
    Loans.findAndCountAll({
      include: [Books, Patrons],
      offset: offset,
      limit: limit,
      order: [
        ["Return_by", "ASC"]
      ]
    }).then(function(loans) {
      let pages = Math.ceil(loans.count / limit);
      res.render("loans", {
        loans: loans.rows,
        page: page,
        pages: pages
      });
    });
  }
});

// GET new loan form //
router.get('/new_loan', function(req, res, next) {
  Books.findAll().then(function(books) {
    Patrons.findAll().then(function(patrons) {
      var loanedOn = moment().format('YYYY-MM-DD');
      var returnBy = moment().add('7', 'days').format('YYYY-MM-DD');
      res.render('forms/new_loan', {
        books: books,
        patrons: patrons,
        loanedOn: loanedOn,
        returnBy: returnBy
      });
    }).catch(function(err) {
      res.sendStatus(500);
    });
  });
});

// POST new loan form //
router.post('/new_loan', function(req, res, next) {
  Loans.create(req.body).then(function(loan) {
    console.log(req.body);
    res.redirect('/loans/all_loans?filter=none&page=1');
  }).catch(function(err) {
    if (err.name === "SequelizeValidationError") {
      Books.findAll().then(function(books) {
        Patrons.findAll().then(function(patrons) {
          var loanedOn = moment().format('YYYY-MM-DD');
          var returnBy = moment().add('7', 'days').format('YYYY-MM-DD');
          res.render('forms/new_loan', {
            books: books,
            patrons: patrons,
            loanedOn: loanedOn,
            returnBy: returnBy,
            errors: err.errors
          });
        }).catch(function(err) {
          res.sendStatus(500);
        });
      });
    } else {
      throw err;
    }
  });
});

module.exports = router;
