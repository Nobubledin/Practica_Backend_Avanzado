'use strict';

const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { Usuario } = require('../../models');

router.post('/', async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const hashedPassword = Usuario.hashPassword(password);

    const user = await Usuario.findOne({ email: email, password: hashedPassword });

    if (!user) {
        res.json({ ok: false, error: 'Invalid Credentials' });
        return;
    }

    jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '1d'
    }, (err, token) => {
        if (err) {
            return next(err);
        }
        res.json({ token: token });
    });
  } catch (error) {
    next(error);
  }
});



module.exports = router;