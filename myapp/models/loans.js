'use strict';

const dateFormat= require('dateformat');
const moment = require('moment');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

module.exports = (sequelize, DataTypes) => {
  const Loans = sequelize.define('Loans', {
    id:{
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    book_id:{
      type:DataTypes.INTEGER,
      validate:{
        notEmpty:{
          msg: 'Please select a book to loan out'
        }
      }
    },
    patron_id:{
      type:DataTypes.INTEGER,
      validate:{
        notEmpty:{
          msg: 'Please select a patron who will loan out the book'
        }
      }
    },
    loaned_on:{
      type: DataTypes.DATEONLY,
      validate:{
        isDate:{
          msg: 'Loaned on must be a valid date'
        }
      }
    },
    return_by:{
      type: DataTypes.DATEONLY,
      validate:{
        isDate:{
          msg: 'Return by must be a valid date'
        }
      }
    },
    returned_on:{
      type: DataTypes.DATEONLY,
    },
  }, {
    timestamps: false
  });

  return Loans;
};
