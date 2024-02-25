'use strict'

const jwt = require('jsonwebtoken')
const createError = require('http-errors');

module.exports = function() {
    return function(req, res, next) {
        const token = req.body.token || req.query.token || req.get('Access-Token');

        if (!token) {
            const err = new Error('No hay token disponible')
            err.status = 401
            return next(err);
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
            if (err) {
            return next(err);
            }

            req.userID = payload._id
            next();
            
        });
    };
};