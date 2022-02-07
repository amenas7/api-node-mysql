const bcrypt = require('bcrypt');

//acceder a coneccion de mysql configurada
const consql = require('../database/database');
const { generarJWT } = require('../helpers/jwt');


// =================================================
// obtener todos las ordenes de compra pendientes
// =================================================
const getOComprasTodasPendientes = (req, res) => {

    const p_desde = req.query.desde;
    const p_hasta = req.query.hasta;

    const p_estado = req.query.estado;

    //2022-01-25 2022-01-26
    if ( p_desde == '' && p_hasta == '' && p_estado == '') {
        consql.query(` select 
        c.compraID, date_format(c.fecha_reg, "%d-%m-%Y") as fecha_reg, c.estado_autorizado, area.nombre_area, c.descripcion, c.reg_fisico, c.codigo
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
        where c.estado_autorizado = "Pendiente"
        GROUP BY c.compraID
        ORDER BY c.compraID DESC `, (err, filas) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando ordenes de compra pendientes',
                    errors: err
                })
            }
            if (!err) {
                if ( filas.length > 0 ) {
                    return res.status(200).json({
                        ok: true,
                        data: filas,
                        uid: req.uid
                    })
                }
                else {
                    return res.status(500).json({
                        ok: false,
                        data: filas,
                        mensaje: 'No existen registros con los filtros seleccionados'
                    })
                }
            }
        });
    }else{
        consql.query(` select 
        c.compraID, date_format(c.fecha_reg, "%d-%m-%Y") as fecha_reg, c.estado_autorizado, area.nombre_area, c.descripcion, c.reg_fisico, c.codigo
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
        where c.estado_autorizado = "${p_estado}" AND c.fecha_reg BETWEEN "${p_desde}" AND "${p_hasta}"
        GROUP BY c.compraID
        ORDER BY c.compraID DESC `, (err, filas) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando ordenes de compra pendientes',
                    errors: err
                })
            }
            if (!err) {
                if ( filas.length > 0 ) {
                    return res.status(200).json({
                        ok: true,
                        data: filas,
                        uid: req.uid
                    })
                }
                else {
                    return res.status(500).json({
                        ok: false,
                        data: filas,
                        mensaje: 'No existen registros con los filtros seleccionados'
                    })
                }
            }
        });
    }
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
    getOComprasTodasPendientes
}