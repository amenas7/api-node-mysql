const express = require('express');

var app = express();


//metodo para definir rutas del servidor
//const router = express.Router();

app.get('/', (req, resp, next) => {
    resp.status(200).json({
        ok: true,
        mensaje: 'peticion realizada correctamente'
    })
});

module.exports = app;