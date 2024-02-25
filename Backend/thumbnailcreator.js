'use strict';

const cote = require('cote');
const jimp = require('jimp');
const fs = require('fs');

const responder = new cote.Responder({
    name: 'thumbnail creator responder',
    key: 'thumbnail creator',
});

const appendSuffix = (fileName, suffix) => {
    const dotPos = fileName.lastIndexOf('.');
    return fileName.substr(0, dotPos) + suffix + fileName.substr(dotPos);
};

responder.on('CreateThumbnail', async (req) => {
    try {
        const { image } = req;
        console.log(`Received CreateThumbnail request for ${image}`);

        const srcImagePath = image;
        const dstImagePath = path.join(__dirname, '/imagenes', appendSuffix(srcImagePath, '_thumbnail'));
        fs.appendFileSync('thumbnail_logs.txt', `srcImagePath: ${srcImagePath}\n`);

        console.log(`Creating thumbnail ${dstImagePath}...`);

        const imageObject = await jimp.read(image);
        console.log(`Read image from path: ${image}`);
        const processedImageBuffer = await imageObject.scaleToFit(100, 100).getBufferAsync();
        console.log('Image processed, creating thumbnail');

        await fs.promises.writeFile(dstImagePath, processedImageBuffer); 
        console.log(`Thumbnail written to: ${dstImagePath}`);
        fs.appendFileSync('thumbnail_logs.txt', `dstImagePath: ${dstImagePath}\n`);

        console.log(`Thumbnail created for image: ${image}`);

        return { success: true, message: 'Thumbnail created successfully' };
   } catch (error) {
        console.error('Error creating thumbnail:', error);
        return { success: false, error: 'Internal Server Error' };
   }
});

console.log('Thumbnail Creator Service started.');