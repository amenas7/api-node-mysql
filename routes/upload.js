var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

//acceder a coneccion de mysql configurada
const consql = require('../database/database');

// default options
app.use(fileUpload());

app.put('/:tipo/:id', async(req, resp, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // tipos de coleccion
    var tiposValidos = ['usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return resp.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no válida',
            errors: { message: 'Tipo de colección no válida' }
        });
    }


    if (!req.files) {
        return resp.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            errors: { message: 'Debe seleccionar una imagen' }
        });
    }

    // obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // solo se acepta estas extensiones
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return resp.status(400).json({
            ok: false,
            mensaje: 'Extension no válida',
            errors: { message: 'Las extensiones válidas son ' + extensionesValidas.join(', ') }
        });
    }

    // nombre de archivo personalizado
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;

    const obtenerImg = await consultar_imagen(resp, id);

    if (obtenerImg == '') {
        return resp.status(400).json({
            ok: false,
            mensaje: 'El usuario con el id ' + id + ' no existe',
            errors: { message: 'No existe un usuario con ese ID' }
        })
    }

    // validar si el usuario ya cuenta con una imagen para poder eliminarla
    if ((obtenerImg[0].img != '')) {
        path = `./archivos/${ tipo }/` + obtenerImg[0].img;

        // si existe, elimina la imagen anterior
        if (fs.existsSync(path)) {
            fs.unlink(path, (error) => {
                if (error) {
                    return resp.status(400).json({
                        ok: false,
                        mensaje: 'No se pudo eliminar la imagen',
                        errors: error
                    });
                }
            });
        }
    }

    // mover el archivo del temporal a una carpeta
    var path = `./archivos/${ tipo }/${ nombreArchivo }`;
    archivo.mv(path, error => {
        if (error) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: error
            });
        }
    })

    // ACtualizar la BD
    const actualizar_imagen = await actualizar(req, resp, id, nombreArchivo);
    if (actualizar_imagen.insertId != '0') {
        return resp.status(400).json({
            ok: false,
            mensaje: 'Error al actualizar imagen'
        });
    }
    return resp.status(200).json({
        ok: true,
        mensaje: 'imagen de usuario actualizada'
    });

});

function consultar_imagen(resp, id) {
    const query = `
    SELECT img from usuario where usuarioID = "${id}"
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

function actualizar(req, resp, id, nombreArchivo) {
    const query = `
    UPDATE usuario
    SET img = "${nombreArchivo}"
    WHERE usuarioID = "${id}"
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

/*-----------------------------**/
async function subirPorTipo(tipo, id, nombreArchivo, resp) {
    if (tipo === 'usuario') {
        const consulta = await consultar_imagen(resp, id);
        if (consulta == '') {
            return resp.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + ' no existe',
                errors: { message: 'No existe un usuario con ese ID' }
            })
        }

    }
}









module.exports = app;