'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const upload = require('../../lib/multerconfig.js');

const Anuncio = mongoose.model('Anuncio');
const { buildAnuncioFilter } = require('../../lib/utils');
const { anuncios } = require('../../local_config');

router.get('/', async (req, res, next) => {
    const start = parseInt(req.query.start) || 0;
    const limit = parseInt(req.query.limit) || 3000;
    const order = req.query.order || '_id';
    const total = req.query.total === 'true';

    const filters = buildAnuncioFilter(req);

    const anuncios = await Anuncio.list(filters, start, limit, order, total);

    res.json({ result: anuncios });
});

router.get('/tags', asyncHandler(async function (req, res) {
    const distinctTags = await Anuncio.distinct('tags');
    res.json({ result: distinctTags });
}));

router.post('/', upload.single('foto'), asyncHandler(async (req, res) => {
    const anuncioData = req.body;

    console.log(req.file);
    const anuncio = new Anuncio(anuncioData);
    const anuncioGuardado = await anuncio.save();

    res.json({ result: anuncioGuardado });
}));


module.exports = router;