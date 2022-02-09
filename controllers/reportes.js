//acceder a coneccion de mysql configurada
const consql = require('../database/database');
const { generarJWT } = require('../helpers/jwt');
const path = require('path');
const { subirArchivo } = require('../helpers/subir-archivo');
const fs = require('fs');
const pdf = require("html-pdf");

// Constantes propias del programa
// const ubicacionPlantilla = require.resolve("../plantilla/demo.html");
// let contenidoHtml = fs.readFileSync(ubicacionPlantilla, 'utf8');
const ubicacionPlantilla = require.resolve("../plantilla/demo.html");
let contenidoHtml = fs.readFileSync(ubicacionPlantilla, 'utf8')

const productos = [
    {
        descripcion: "Nintendo Switch",
        cantidad: 2,
        precio: 9000,
    },
    {
        descripcion: "Videojuego: Hollow Knight",
        cantidad: 1,
        precio: 150,
    },
    {
        descripcion: "Audífonos HyperX",
        cantidad: 5,
        precio: 1500,
    },
];

const formateador = new Intl.NumberFormat("en", { style: "currency", "currency": "MXN" });
// =======================================================
// Generar reporte pdf a una orden de compra
// =======================================================
const getReporteByID = async (req, res) => {

    const id = req.params.id;

    const obtenerReg = await consultar_existe_compra(req, res, id);

     if ( obtenerReg == '' ) {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error orden de compra no encontrada'
        })
    }

    const config = {
        format: 'A4',
        //border: '0.2cm'
    }


    const reg_cabecera = await consultar_cabecera(req, res, id);

    //return console.log(reg_cabecera[0]['total_compra']);

    const reg_detalle = await consultar_detalle_productos(req, res, id);

    let tabla = "";
    //let subtotal = 0;
    let contador = 0;
    for (const producto of reg_detalle) {
        contador ++;
        tabla += `<tr>
            <th>${ contador }</th>
            <td>${ producto.sku }</td>
            <td>${ producto.codigo_de_fabrica }</td>
            <td>${ producto.marca }</td>
            <td>${ producto.nombre_item }</td>
            <td> unidad </td>
            <td>${ producto.cantidad }</td>
            <td>${ producto.precio_bs_referencial }</td>
            <td>${ producto.monto }</td>
        </tr>`;
    }
    // const descuento = 0;
    // const subtotalConDescuento = subtotal - descuento;
    // const impuestos = subtotalConDescuento * 0.16
    // const total = subtotalConDescuento + impuestos;
    // Remplazar el valor {{tablaProductos}} por el verdadero valor
    contenidoHtml = contenidoHtml.replace( "{{tablaProductos}}", tabla );

    // Y también los otros valores
    contenidoHtml = contenidoHtml.replace( "{{sub_total}}", reg_cabecera[0]['sub_total'] );
    contenidoHtml = contenidoHtml.replace( "{{descuento}}", reg_cabecera[0]['descuento'] );
    contenidoHtml = contenidoHtml.replace( "{{total_compra}}", reg_cabecera[0]['total_compra'] );
    // contenidoHtml = contenidoHtml.replace("{{descuento}}", formateador.format(descuento));
    // contenidoHtml = contenidoHtml.replace("{{subtotalConDescuento}}", formateador.format(subtotalConDescuento));
    // contenidoHtml = contenidoHtml.replace("{{impuestos}}", formateador.format(impuestos));
    // contenidoHtml = contenidoHtml.replace("{{total}}", formateador.format(total));
    pdf.create(contenidoHtml, config).toStream((error, stream) => {
        if (error) {
            res.end("Error creando PDF: " + error)
        } else {
            res.setHeader("Content-Type", "application/pdf");
            stream.pipe(res);
        }
    });
}

function consultar_existe_compra(req, res, id) {
    const query = `
    select count(compraID) as cantidad from compra
    where compraID = "${id}" `;

    //return console.log(query);
    return new Promise((resolve, reject) => {
        consql.query(query, (err, rows, fields) => {
            if (err) {
                return reject(err);
            }
            resolve(rows[0]['cantidad']);
        });
    });
}

function consultar_cabecera(req, res, id) {
    const query = `select 
    *, date_format(fecha_reg, "%d-%m-%Y") as fecha_registro_compra from compra
    where compraID = "${id}"  `;

    //return console.log(query);
    return new Promise((resolve, reject) => {
        consql.query(query, (err, rows, fields) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
}

function consultar_detalle_productos(req, res, id) {
    const query = `select 
    item.itemID, 'sku', item.codigo_de_fabrica, item.marca, item.nombre_item, de.cantidad, item.precio_bs_referencial, de.monto
        from
            compra_detalle de
        inner join item
        on item.itemID = de.itemID
    where de.compraID = "${id}"  `;

    //return console.log(query);
    return new Promise((resolve, reject) => {
        consql.query(query, (err, rows, fields) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
}

// const cargaArchivo = async (req, res) => {
 
//     if ( !req.files || Object.keys(req.files).length === 0 || !req.files.archivo ) {
//       res.status(400).json( {mensaje:'No hay archivos que subir'} );
//       return;
//     }

//     try {

//         // solo pdf
//         const pathCompleto = await subirArchivo( req.files, ['pdf'], 'documentos' );

//         res.json({
//             nombre: pathCompleto
//         })
        
//     } catch (error) {
//         res.status(400).json({
//             error
//         })
//     }

// }

// =======================================================
// obtener todos los archivos segun una orden de compra
// =======================================================
const getArchivosByID = async (req, res) => {
    const id = req.params.id;
    
    const obtenerReg = await consultar_existe_documento(req, res, id);

     if ( obtenerReg == '' ) {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error archivo no encontrado'
        })
    }

    const listado = await consultar_archivos(req, res, id);

    return res.status(200).json({
        ok: true,
        data : listado
    });
}

function consultar_archivos(req, res, id) {
    const query = `select 
    archivoID, compraID, nombre_archivo_original, nombre_archivo_server, 
    date_format(fecha_reg, "%d-%m-%Y") fecha_reg, registradoPorID
    from archivo
    where archivoID = "${id}"  `;

    //return console.log(query);
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
// regisutrar un documento
// ==========================================
const cargaArchivo = async (req, res) => {

    const id = req.body.compraID;
    const registradoPorID = req.body.registradoPorID;
 
    if ( !req.files || Object.keys(req.files).length === 0 || !req.files.archivo ) {
      res.status(400).json( {mensaje:'No hay archivos que subir'} );
      return;
    }

    try {

        // solo pdf
        const nombre_documento = await subirArchivo( req.files, ['pdf'], 'documentos' );

        let arreglo = {
            idc: id,
            registradoPorID,
            nombre_documento : nombre_documento['nombreTemp'],
            nombreOriginal: nombre_documento['nombreOriginal']
        }

        const reg = await registrar_documento_a_la_compra(req, res, arreglo);

        if ( reg.insertId < 1 ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al subir documento'
            })
        }
        else{
            return res.status(200).json({
                ok: true,
                mensaje: 'Documento subido correctamente'
            })
        }
        
    } catch (error) {
        res.status(400).json({
            error
        })
    }

}

function registrar_documento_a_la_compra(req, res, arreglo) {

    const p_idc = arreglo.idc;
    const p_nombreOriginal = arreglo.nombreOriginal;
    const p_nombre_documento = arreglo.nombre_documento;
    const p_registradoPorID = arreglo.registradoPorID;

    //return console.log(p_nombreOriginal);

    const query = `
    insert into archivo ( compraID, nombre_archivo_original, nombre_archivo_server, fecha_reg, registradoPorID ) values 
    ( "${p_idc}", "${p_nombreOriginal}", "${p_nombre_documento}", now(), "${p_registradoPorID}" ) `;

    return new Promise((resolve, reject) => {
        consql.query(query, (err, rows, fields) => {
            if (err) {
                consql.rollback(()=>{
                    return reject(err);
                });
            }
            resolve(rows);
        });
    });
}


// ==========================================
// borrar un documento
// ==========================================
const borrarArchivo = async (req, res) => {

    const id = req.params.id;

    const obtenerReg = await consultar_existe_documento(req, res, id);

    if ( obtenerReg == '' ) {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error archivo no encontrado'
        })
    }

    // si existe, elimina la imagen fisica
    const obtenerReg_fisico = await consultar_existe_documento_fisico(req, res, id);
    const pathImagen = path.join(__dirname , '../archivos/documentos/', obtenerReg_fisico );

    if ( fs.existsSync(pathImagen) ) {
        fs.unlinkSync(pathImagen);
    }
 
    const reg = await eliminar_documento_a_la_compra(req, res, id);

    if ( reg.affectedRows < 1 ) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Error al eliminar documento'
        })
    }
    else{
        return res.status(200).json({
            ok: true,
            mensaje: 'Documento eliminado correctamente'
        })
    }
        


}

function consultar_existe_documento(req, res, id) {
    const query = `
    select count(compraID) as cantidad from archivo
    where archivoID = "${id}" `;

    //return console.log(query);
    return new Promise((resolve, reject) => {
        consql.query(query, (err, rows, fields) => {
            if (err) {
                return reject(err);
            }
            resolve(rows[0]['cantidad']);
        });
    });
}

function consultar_existe_documento_fisico(req, res, id) {
    const query = `
    select nombre_archivo_server from archivo
    where archivoID = "${id}" `;

    //return console.log(query);
    return new Promise((resolve, reject) => {
        consql.query(query, (err, rows, fields) => {
            if (err) {
                return reject(err);
            }
            resolve(rows[0]['nombre_archivo_server']);
        });
    });
}

function eliminar_documento_a_la_compra(req, res, id) {
    const query = `
    delete from archivo
    where archivoID = "${id}" `;

    //return console.log(query);
    return new Promise((resolve, reject) => {
        consql.query(query, (err, rows, fields) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
}

module.exports = {
    getReporteByID
}