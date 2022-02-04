const mysql = require('mysql');

// coneccion a la BD
const mysqlConnection = mysql.createConnection({
    // host: 'localhost',
    // user: 'root',
    // password: '',
    // database: 'app_vuela',
    // multipleStatements: true

    host: '161.35.100.169',
    user: 'TuUsuarioNombreAleatorio',
    password: '12Ghj8.,JhGf54%66f#235#4ffcJJ0)7kg56UuBv5#4ffcxda5Gr',
    database: 'app_vuela',
    insecureAuth : true,
    multipleStatements: true

    // host: '173.212.208.69',
    // user: 'SYSDBA',
    // password: 'masterkey',
    // database: 'distrijavime',
    // insecureAuth : true,
    // multipleStatements: true
});


mysqlConnection.connect(function(err) {
    if (err) throw err;

    console.log('Estado de BD : \x1b[32m%s\x1b[0m', 'online');

});

module.exports = mysqlConnection;