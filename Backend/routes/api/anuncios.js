'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const upload = require('../../lib/multerconfig.js');
const path = require('path');
const fs = require('fs').promises;
const Jimp = require('jimp');

const Anuncio = mongoose.model('Anuncio');
const { buildAnuncioFilter } = require('../../lib/utils');
const { anuncios } = require('../../local_config');

const rootDestinationFolder = '../imagenes';
const rootDestinationFolderPath = path.join(__dirname, '..', rootDestinationFolder);
const thumbnailFolder = '../thumbnails';
const thumbnailFolderPath = path.join(rootDestinationFolderPath, thumbnailFolder);

const createRootDestinationFolder = async () => {
    try {
        await fs.access(rootDestinationFolderPath);
        await fs.access(thumbnailFolderPath); // Check if the thumbnail folder exists
    } catch (error) {
        await fs.mkdir(rootDestinationFolderPath, { recursive: true });
        await fs.mkdir(thumbnailFolderPath, { recursive: true }); // Create the thumbnail folder
        console.log(`Created root destination folder: ${rootDestinationFolderPath}`);
        console.log(`Created thumbnail folder: ${thumbnailFolderPath}`);
    }
};

createRootDestinationFolder();

router.get('/', async (req, res, next) => {
    // ... (unchanged code for handling GET request)
});

router.get('/tags', asyncHandler(async function (req, res) {
    // ... (unchanged code for handling GET request for tags)
}));

router.post('/', upload.single('foto'), asyncHandler(async (req, res) => {
    try {
        const anuncioData = req.body;

        // Check if the file was uploaded successfully
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        const imageBuffer = req.file.buffer;

        // Generate unique filenames for the uploaded image and its thumbnail
        const uniqueFilename = generateUniqueFileName(req.file.originalname);
        const uniqueThumbnailFilename = generateUniqueFileName('thumbnail_' + req.file.originalname);

        // Specify the paths for the new destination files in the /backend/imagenes folder
        const rootDestinationFilePath = path.join(rootDestinationFolderPath, uniqueFilename);
        const thumbnailFilePath = path.join(thumbnailFolderPath, uniqueThumbnailFilename);

        // Write the image buffer to the new destination file
        await fs.writeFile(rootDestinationFilePath, imageBuffer);

        // Create a thumbnail using Jimp
        const image = await Jimp.read(imageBuffer);
        await image.resize(100, 100).write(thumbnailFilePath);

        // Create a new Anuncio instance with the updated image and thumbnail paths
        const anuncio = new Anuncio(anuncioData);
        anuncio.foto = rootDestinationFilePath;
        anuncio.thumbnail = thumbnailFilePath;

        // Save the Anuncio with the updated image and thumbnail paths
        const anuncioGuardado = await anuncio.save();

        // Respond with the result
        res.json({ result: anuncioGuardado });
    } catch (error) {
        console.error('Error processing image:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}));

function generateUniqueFileName(originalFilename) {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 7);
    const fileExtension = path.extname(originalFilename);
    return `${timestamp}_${randomString}${fileExtension}`;
}

module.exports = router;
