'use strict'

const cote = require('cote');
const jimp = require('jimp');

const Responder = new cote.Responder({
    name: 'thumbnail creator'
}, {log: false, statusLogsEnabled: false});


const appendSuffix = (fileName, suffix) => {
    const lastDotIndex = fileName.lastIndexOf('.');
    return fileName.substr(0, lastDotIndex) + suffix + fileName.substr(lastDotIndex);
}

Responder.on('CreateThumbnail', async req => {
    const srcImage = req.image;
    const destImage = appendSuffix(srcImage, '_thumbnail');

    console.log('Creating thumbnail');

    const image = await jimp.read(req.image);
    return image
        .scale(100, 100)
        .write(destImage);
});

console.log('ThumbnailCreator has started')