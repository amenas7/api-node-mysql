// requires
var express = require('express');
var bodyParser = require('body-parser');

const cors = require('cors');

var fileUpload = require('express-fileupload');

// inicializar variables
var app = express();

// habilitar CORS
// app.use(function(req, res, next) {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
//     res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
//     next();
// });

// configurar nuevos cors
app.use( cors({ origin: true, credentials: true }) );

// body parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/',
    createParentPath: true
}));


// importar rutas
app.use( '/usuario', require('./routes/usuario') );
app.use( '/login', require('./routes/login') );
app.use( '/upload', require('./routes/upload') );
app.use( '/', require('./routes/app') );

/* ---- funcional ---- */
app.use( '/api/login', require('./routes/auth') );
app.use('/api/usuarios', require('./routes/usuarios') );
app.use('/api/monedas', require('./routes/monedas') );
app.use('/api/proveedores', require('./routes/proveedores') );
app.use('/api/almacenes', require('./routes/almacenes') );
app.use('/api/item', require('./routes/item') );
app.use('/api/ocompra', require('./routes/ocompra') );
app.use('/api/autorizaciones', require('./routes/autorizaciones') );
app.use('/api/autorizacionespend', require('./routes/autorizacionespend') );
app.use('/api/autorizacionesproc', require('./routes/autorizacionesproc') );
app.use('/api/usuarios_estado', require('./routes/usuarios_estado') );
app.use('/api/usuarios_rol', require('./routes/usuarios_rol') );
app.use('/api/comentarios', require('./routes/comentarios') );
app.use('/api/archivos', require('./routes/archivos') );
app.use('/api/reportes', require('./routes/reportes') );
app.use('/api/itemp', require('./routes/itemp') );
app.use('/api/area', require('./routes/area') );
app.use( '/api/loginG', require('./routes/loginG') );
app.use( '/api/usuarios_filtro', require('./routes/usuarios_filtro') );
app.use( '/api/descargar_archivo', require('./routes/descargar_archivo') );
// escuchar peticiones
app.listen(8080, () => {
    console.log('Express server puerto 8080: \x1b[32m%s\x1b[0m', 'online');
});