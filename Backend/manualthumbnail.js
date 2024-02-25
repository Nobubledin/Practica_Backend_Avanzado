const cote = require('cote');
const thumbnailCreatorRequester = new cote.Requester({ name: 'thumbnail creator requester' });

thumbnailCreatorRequester.send({ type: 'createThumbnail', imagePath: './WoW2.png' }, response => {
    if (response.success) {
        console.log(response.message);
    } else {
        console.error(response.error);
    }
});