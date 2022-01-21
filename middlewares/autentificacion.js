var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;
// ==========================================
// verificar token
// ==========================================
exports.verificaToken = function(req, resp, next) {
    var token = req.query.token;
    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return resp.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            })
        }
        req.usuario = decoded.usuario;
        next();
    });

}