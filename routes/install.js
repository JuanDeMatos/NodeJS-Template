const sqlite3 = require('sqlite3');
var express = require('express');
const dbFunciones = require('./db').dbFactory('sqlite');
var router = express.Router();

let resultado = "Instalado correctamente";

router.get('/', function(req, res) {
    dbFunciones.createDatabase();
    res.render('install', {resultado : resultado});
});

module.exports = router;
