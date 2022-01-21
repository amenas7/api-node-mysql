const express = require('express');
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

var mdAutentificacion = require('../middlewares/autentificacion');

var app = express();


//acceder a coneccion de mysql configurada
const consql = require('../database/database');


//metodo para definir rutas del servidor
//const router = express.Router();


// ==========================================
// obtener todos los usuarios
// ==========================================
app.get('/', (req, resp, next) => {

    consql.query('SELECT * FROM usuario', (err, filas) => {
        if (err) {
            return resp.status(500).json({
                ok: false,
                mensaje: 'Error cargando usuarios',
                errors: err
            })
        }
        if (!err) {
            return resp.status(200).json({
                ok: true,
                usuarios: filas
            })
        }
    });
});






// ==========================================
// crear un nuevo usuario
// ==========================================
app.post('/', async(req, resp, next) => {
    const p_nombre = req.body.nombre;
    const p_usuario = req.body.usuario;
    const p_password = bcrypt.hashSync(req.body.password, 10);

    const query = `
    INSERT INTO usuario(nombre, usuario, password, role, fecha_reg) 
    values ("${p_nombre}", "${p_usuario}", "${p_password}",'admin', now() )
    `;

    const reg = await registrar(req, resp, query);
    if (reg == '') {
        return resp.status(400).json({
            ok: false,
            mensaje: 'Error al crear usuario'
        })
    }
    const consulta = await consultar(req, resp, reg);
    let arreglo = {
        id: consulta[0].usuarioID,
        nombre: consulta[0].nombre,
        usuario: consulta[0].usuario,
        password: consulta[0].password,
        role: consulta[0].role
    }
    resp.status(201).json({
        ok: true,
        usuario: arreglo,
        usuariotoken: req.usuario
    });
});

function registrar(req, resp, query) {
    return new Promise((resolve, reject) => {
        consql.query(query, (err, rows, fields) => {
            if (err) {
                return reject(err);
            }
            resolve(rows.insertId);
        });
    });
}

function actualizar(req, resp, arreglo) {
    const p_id = arreglo.id;
    const p_nombre = arreglo.nombre;
    const p_usuario = arreglo.usuario;
    const p_role = arreglo.role;

    const query = `
    UPDATE usuario
    SET nombre = "${p_nombre}",
    usuario = "${p_usuario}",
    role = "${p_role}" 
    WHERE usuarioID = "${p_id}"
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

function consultar(req, resp, reg) {
    const query = `
    SELECT * from usuario where usuarioID = "${reg}"
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

// ==========================================
// actualizar un nuevo usuario
// ==========================================
app.put('/:id', mdAutentificacion.verificaToken, async(req, resp) => {
    const reg = req.params.id;
    const p_nombre = req.body.nombre;
    const p_usuario = req.body.usuario;
    const p_role = req.body.role;

    const obtenerReg = await consultar(req, resp, reg);
    if (obtenerReg == '') {
        return resp.status(500).json({
            ok: false,
            mensaje: 'Error usuario no encontrado'
        })
    }
    let arreglo = {
        id: reg,
        nombre: p_nombre,
        usuario: p_usuario,
        role: p_role
    }
    const actualizareg = await actualizar(req, resp, arreglo);
    if (actualizareg.insertId != '0') {
        return resp.status(400).json({
            ok: true,
            mensaje: 'Error al actualizar usuario'
        });
    }

    const consultar_nuevo = await consultar(req, resp, reg);

    let arreglonuevo = {
        id: consultar_nuevo[0].usuarioID,
        nombre: consultar_nuevo[0].nombre,
        usuario: consultar_nuevo[0].usuario,
        password: consultar_nuevo[0].password,
        role: consultar_nuevo[0].role
    }
    resp.status(200).json({
        ok: true,
        usuario: arreglonuevo
    });
});














module.exports = app;