var express = require('express');
const dbFunciones = require('./db').dbFactory('sqlite')
var router = express.Router();
const perm = require('../permissions');

router.use(express.urlencoded({
    extended: true
}))

router.get('/', (req, res) => {
    if (req.session.permission === perm.ADMIN) {
        res.render('control', {
            pass_error: "none",
            admin: "block"
        });
    } else {
        res.render('control', {
            pass_error: "none",
            admin: "none"
        });
    }
})

router.post("/", (req, res) => {

    

    if (req.body.submit === "Cambiar contraseña") {
        let pass1 = req.body['pass1']
        let pass2 = req.body['pass2']
        let user = req.session.usuario

        console.log(pass1);
        console.log(pass2);

        if (pass1 === pass2) {
            dbFunciones.cambiarPass(user, pass1);
            res.redirect('control')
        } else {
            res.render('control', {
                pass_error: "block"
            });

        }
    } else {
        if (req.session.permission === perm.ADMIN) {
            res.render('control', {
                pass_error: "none",
                admin: "block"
            });
        } else {
            res.render('control', {
                pass_error: "none",
                admin: "none"
            });
        }
    }

})





module.exports = router;