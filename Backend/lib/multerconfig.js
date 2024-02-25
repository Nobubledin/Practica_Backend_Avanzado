'use strict'

const express = require('express');
const multer = require('multer')
const path = require('path')


const storage = multer.memoryStorage({
  destination: function (req, file, cb) {
    const destinationPath = path.join(__dirname, '../uploads');
    cb(null, destinationPath);
  },
  filename: function (req, file, cb) {
    const filename = Date.now() + '-' + file.originalname;
    cb(null, filename)
  }
})

const upload = multer({storage});


module.exports = upload;