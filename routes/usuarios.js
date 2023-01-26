var express = require('express');
var router = express.Router();
const dbFunciones = require('./db').dbFactory('sqlite');
const perm = require('../permissions');


router.use(express.urlencoded({
    extended: true
}))

router.get('/', (req, res) => {

    function funMostrar(rows) {
        res.render('usuarios', {usuarios : rows, perm_admin : perm.ADMIN, perm_user : perm.USER});
    }

    dbFunciones.findAllUsuarios(funMostrar);
})

router.post("/", (req,res) => {
    let user = req.body['user']
    let submit = req.body['submit']
    let permiso = req.body.permisos
    let pass;

    if (submit === "Cambiar contraseña") {
        pass = req.body['pass']
        dbFunciones.cambiarPass(user,pass);
        
    } else if (submit === "Cambiar permisos") {
        if (permiso != undefined) {
            dbFunciones.cambiarPermisos(user,permiso)
        }
    } else {
        if (submit === "Borrar usuario") {
            dbFunciones.borrarUsuario(user)
        } else {
            pass = req.body['pass']
            dbFunciones.addUsuario(user,pass)
        }
    }
    res.redirect('usuarios')
})

module.exports = router;