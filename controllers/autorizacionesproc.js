const bcrypt = require('bcrypt');

//acceder a coneccion de mysql configurada
const consql = require('../database/database');
const { generarJWT } = require('../helpers/jwt');


// ==========================================
// obtener todos las ordenes de compra procesadas
// ==========================================
const getOComprasTodasProcesados = (req, res) => {
    consql.query(` select 
    c.compraID, c.fecha_reg, c.estado_autorizacion, area.nombre_area, c.descripcion, c.reg_fisico
    from
    compra c
    inner join compra_detalle de
    on c.compraID = de.compraID
    inner join proveedor prov
    on prov.proveedorID = c.proveedorID
    inner join item
    on item.itemID = de.itemID
    inner join area
    on area.IDarea = c.area_solicitanteID
    where c.estado_autorizacion = 'Procesado'
    GROUP BY c.compraID
    ORDER BY c.compraID DESC `, (err, filas) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando ordenes de compra procesados',
                errors: err
            })
        }
        if (!err) {
            return res.status(200).json({
                ok: true,
                data: filas,
                uid: req.uid
            })
        }
    });
}

// ==========================================
// obtener una orden de compra por el ID
// ==========================================
const getOCompraByID = (req, res) => {
    const id = req.params.id;

    consql.query(` select 
    c.compraID, item.itemID, item.codigo_de_fabrica, 
    item.marca, item.nombre_item,
    de.cantidad, item.precio_bs_referencial, de.monto
    
    from compra_detalle de
    inner join compra c 
    on de.compraID = c.compraID
    inner join proveedor prov
    on prov.proveedorID = c.proveedorID
    inner join item
    on item.itemID = de.itemID
    where c.compraID = "${id}" `, (err, filas) => {

        try {

            if ( filas.length == 0 ) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'No existe una orden de compra con el parametro buscado'
                })
            }
            else{
               return res.status(200).json({
                    ok: true,
                    data: filas,
                    uid: req.uid
                }) 
            }

        } catch (error) {
            console.log(err);
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando ordenes de compra',
                error: err
            })
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

module.exports = {
    getOComprasTodasProcesados
}