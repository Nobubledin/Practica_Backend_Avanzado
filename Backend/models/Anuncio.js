'use strict';

const mongoose = require('mongoose');
const fsPromises = require('fs').promises;
const configAnuncios = require('../local_config').anuncios;
const path = require('path');

const anuncioschema = mongoose.Schema({
  nombre: { type: String, index: true },
  venta: { type: Boolean, index: true },
  precio: { type: Number, index: true },
  foto: String,
  tags: { type: [String], index: true }
});

anuncioschema.statics.allowedTags = function () {
  return ['trabajo', 'diario', 'motor', 'móvil'];
};

anuncioschema.statics.cargaJson = async function (fichero) {

  const data = await fsPromises.readFile(fichero, { encoding: 'utf8' });

  if (!data) {
    throw new Error(fichero + ' está vacío!');
  }

  const anuncios = JSON.parse(data).anuncios;
  const numAnuncios = anuncios.length;

  for (var i = 0; i < anuncios.length; i++) {
    await (new Anuncio(anuncios[i])).save();
  }

  return numAnuncios;
};

anuncioschema.statics.list = async function (filters, startRow, numRows, sortField, includeTotal, cb) {

  const query = Anuncio.find(filters);
  query.sort(sortField);
  query.skip(startRow);
  query.limit(numRows);

  const result = {};

  if (includeTotal) {
    result.total = await Anuncio.countDocuments();
  }
  result.rows = await query.exec();

  const ruta = configAnuncios.imagesurlBasePath;
  result.rows.forEach(r => r.foto = r.foto ? path.join(ruta, r.foto) : null);

  if (cb) return cb(null, result);
  return result;
};

anuncioschema.methods.Foto = async function({path, originalname: originalname}) {
  if(!originalname) return


const imagePublicPath = path.join(__dirname, '../public/images/anuncios', originalname)
await fsPromises.copy(path, imagePublicPath)

this.Foto = originalname;

thumbnailRequest.send({type: 'createThumbnail', image: imagePublicPath})

}

const Anuncio = mongoose.model('Anuncio', anuncioschema);

module.exports = Anuncio;
