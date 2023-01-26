var express = require('express');
const sqlite3 = require('sqlite3');
var router = express.Router();

router.use(express.urlencoded({
  extended: true
}))

let db = new sqlite3.Database('./db/datos.db', sqlite3.OPEN_READWRITE |
    sqlite3.OPEN_CREATE, (err) => {
        if (err) {
            resultado = err;
            console.log("Error: " + err);
            process.exit(1);
        }
});

router.get('/', (req, res) => {

  res.render('index', {display : "none"});

})


module.exports = router;
