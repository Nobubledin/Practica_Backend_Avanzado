'use strict';

const router = require('express').Router();
const fsPromises = require('fs').promises;
const path = require('path');
const asyncHandler = require('express-async-handler');


router.get('/', async (req, res) => {
    const readmePath = path.join(__dirname, '../README.md');
    const readmeContent = await fsPromises.readFile(readmePath, 'utf8');

    res.render('index', { readmeContent }); 
});

module.exports = router;