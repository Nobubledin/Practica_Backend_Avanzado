'use strict'

const express = require('express');
const multer = require('multer')
const path = require('path')


const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    cb(null, path.join(__dirname, '../upload'))
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
})

const upload = multer({storage});


module.exports = upload;