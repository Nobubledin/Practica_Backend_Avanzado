'use strict';

const router = require('express').Router();
const fsPromises = require('fs').promises;
const path = require('path');
const asyncHandler = require('express-async-handler');
const { read } = require('fs');

router.get('/', asyncHandler(async(req, res) => {
    const userLanguage = req.headers['accept-language'].split(',')[0].toLowerCase();

    const readmePath = path.join(__dirname, `../Readme_${userLanguage}.md`);

    console.log('Readme Path', readmePath);

    try {
        const readmeContent = await fsPromises.readFile(readmePath, 'utf8');

        res.render('index', {readmeContent});
    } catch(error){
        console.error('Error reanding reamde:', error);
        res.status(404).send('Readme not found for the specified language.');
    }
}));


module.exports = router;