'use strict';

const cote = require('cote');
const jimp = require('jimp');

const responder = new cote.Responder({
  name: 'thumbnail creator responder',
  key: 'thumbnail-creator',
});

const appendSuffix = (fileName, suffix) => {
  const dotPos = fileName.lastIndexOf('.');
  return fileName.substr(0, dotPos) + suffix + fileName.substr(dotPos);
};

responder.on('createThumbnail', async (req) => {
  try {
    const { image } = req;
    console.log(`Received createThumbnail request for image:`);

    const srcImagePath = image;
    const dstImagePath = appendSuffix(srcImagePath, '_thumbnail');

    console.log(`Creating thumbnail ${dstImagePath}...`);

    const imageObject = await jimp.read(image);
    console.log('Read image from path: ${image}');
    const processedImageBuffer = await imageObject.scaleToFit(100, 100).getBufferAsync();
    console.log('Image processed, creating thumbnail');

    console.log(`Thumbnail created for image: ${image}`);

    return { success: true, message: 'Thumbnail created successfully' };
  } catch (error) {
    console.error('Error creating thumbnail:', error);
    return { success: false, error: 'Internal Server Error' };
  }
});

console.log('Thumbnail Creator Service started.');