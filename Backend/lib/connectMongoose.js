const mongoose = require('mongoose');
const Anuncio = require('../models/Anuncio');

mongoose.connection.on('error', err => {
    console.log('Error de conexión', err);
});

mongoose.connection.once('open', () => {
    console.log('Conectado a Mongo en', mongoose.connection.name);
})

const connectionPromise = mongoose.connect('mongodb://127.0.0.1/backend', {});

module.exports = connectionPromise;