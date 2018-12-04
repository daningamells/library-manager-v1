const express = require('express');
const router = express.Router();
const Books = require("../models").Books;
const Loans = require("../models").Loans;
const Patrons = require("../models").Patrons;
const moment = require('moment');
const Sequelize = require('sequelize');

const Op = Sequelize.Op;

// GET all patrons //
router.get("/all_patrons", (req, res) => {
  Patrons.findAll({
    order: [
      ["first_name", "ASC"]
    ]
  }).then((patrons) => {
    res.render("patrons", {
      patrons: patrons
    });
  });
});

// GET new patrons form
router.get("/new_patron", (req, res) => {
  res.render("forms/new_patron", {
    patron: Patrons.build()
  });

});

// POST - Create new patron //
router.post("/new_patron", (req, res) => {
  Patrons.create(req.body).then((patron) => {
    res.redirect('all_patrons');
  }).catch((err) => {
    if (err.name === "SequelizeValidationError") {
      res.render('forms/new_patron', {
        patron: Patrons.build(req.body),
        errors: err.errors
      });
    } else {
      throw err;
    }
  });
});

// Get book details. //
router.get('/patron_detail/:id', function(req, res, next) {
  Patrons.findByPk(req.params.id).then(function(patron) {
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
        patron_id: req.params.id
      }
    }).then(function(data) {
      console.log(data);
      res.render('patrons/patron_detail', {
        patron: patron,
        loans: data
      });
    })
  });
});

// POST update Patron //
router.post('/patron_detail/:id', function(req, res, next) {
  Patrons.findById(req.params.id).then(function(patron) {
    return patron.update(req.body);
  }).then(function() {
    res.redirect('/patrons/all_patrons');
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
          patron_id: req.params.id
        }
      }).then(function(data) {
        req.body.id = req.params.id;
        res.render('patrons/patron_detail', {
          patron: req.body,
          loans: data,
          errors: err.errors
        });
      }).catch(function(err) {
        res.sendStatus(500);
      });
    } else {
      throw err;
    }
  });
});

// POST search results
router.post('/all_patrons/search', (req, res) => {
  const searchInput = req.body.searchInput;
  Patrons.findAll({
      where: {
        [Op.or]: [{
            first_name: {
              [Op.like]: `%${searchInput}%`
            }
          },
          {
            last_name: {
              [Op.like]: `%${searchInput}%`
            }
          },
          {
            email: {
              [Op.like]: `%${searchInput}%`
            }
          },
          {
            address: {
              [Op.like]: `%${searchInput}%`
            }
          },
          {
            library_id: {
              [Op.like]: `%${searchInput}%`
            }
          },
          {
            zip_code: {
              [Op.like]: `%${searchInput}%`
            }
          }
        ]
      }
    })
    .then(patrons => {
      res.render('patrons', {
        patrons: patrons
      });
    })
    .catch(error => {
      console.log(error);
    })
})

module.exports = router;
