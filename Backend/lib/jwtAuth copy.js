'use strict'

const jwt = require('jsonwebtoken')
const createError = require('http-errors');

module.exports = function() {
    return function(req, res, next) {
        const token = req.body.token || req.query.token || req.get('Access-Token');

        if (!token) {
            next(createError(401,'No hay token disponible'))
            return;
        }
        console.log(token);
        const payload = jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
            if (err) {
                next(createError(401, 'Token no valido'));
            return;
            }
            next();
            console.log(token);
            
        });
    };
};