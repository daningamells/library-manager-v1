const express = require('express');
const router = express.Router();
const Books = require("../models").Books;
const Loans = require("../models").Loans;
const Patrons = require("../models").Patrons;
const moment = require('moment');
const Sequelize = require('sequelize');

const Op = Sequelize.Op;

// GET home page. //
router.get('/', (req, res) => {
  res.render('index')
});

module.exports = router;
