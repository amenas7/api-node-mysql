const express = require('express');
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();

//acceder a coneccion de mysql configurada
const consql = require('../database/database');

// ==========================================
// login de usuario
// ==========================================
app.post('/', async(req, resp) => {
    const body = req.body;

    const obtenerReg = await consultar_usuario(req, resp, body);
    if (obtenerReg == '') {
        return resp.status(400).json({
            ok: false,
            mensaje: 'Usuario incorrecto'
        })
    }

    if (!bcrypt.compareSync(body.password, obtenerReg[0].password)) {
        return resp.status(400).json({
            ok: false,
            mensaje: 'Credenciales incorrectas - password'
        })
    }
    let arreglo = {
        id: obtenerReg[0].usuarioID,
        nombre: obtenerReg[0].nombre,
        usuario: obtenerReg[0].usuario,
        role: obtenerReg[0].role
    }

    // crear token
    var token = jwt.sign({ usuario: arreglo }, SEED, { expiresIn: 14400 }); // expira en 4h


    resp.status(200).json({
        ok: true,
        usuario: arreglo,
        id: obtenerReg[0].usuarioID,
        token: token,
        role: obtenerReg[0].role,
        message : 'Login correcto'
    });
    //console.log(obtenerReg);

    // resp.status(202).json({
    //     ok: true,
    //     mensaje: 'login post correcto',
    //     body: body
    // });
});



function consultar_usuario(req, resp, body) {
    const p_usuario = body.usuario;
    const query = `
    SELECT * from usuario where usuario = "${p_usuario}"
    `;
    return new Promise((resolve, reject) => {
        consql.query(query, (err, rows, fields) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
}





























module.exports = app;