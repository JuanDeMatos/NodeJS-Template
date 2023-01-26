const express = require('express')
var createError = require('http-errors');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var logger = require('morgan');


// Se cargan las rutas
var indexRouter = require('./routes/index');
var installRouter = require('./routes/install');
var controlRouter = require('./routes/control');
var loginRouter = require('./routes/login');
var logoutRouter = require('./routes/logout');
var usuariosRouter = require('./routes/usuarios')

const app = express()

const path = require('path')
app.use('/', express.static(path.join(__dirname, 'public'))) 

app.use(express.urlencoded({
    extended: true
}))

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("secret"));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
    session({
        secret: "Contraseña", 
        cookie: { maxAge: 10*60*1000 }, 
        saveUninitialized: false,
        resave: false
    })
)



// Listado de las páginas que se pueden ver sin autentificación
const public_pages = [
    "/",
    "/login",
    "/install",
];

// Listado de permisos
const perm = require("./permissions")

// Listado de páginas que requieren algún tipo de autorización especial
const private_pages = {
    "/logout": [perm.USER, perm.ADMIN],
    "/control": [perm.USER, perm.ADMIN],
    "/usuarios" : [perm.ADMIN]
};

// Control de sesión iniciada
app.use((req, res, next) => {
    // Se verifica que el usuario haya iniciado sesión
    if(req.session.usuario) {
        // Se verifica que el usuario tiene permisos para visitar la página
        if(
            (
                req.url in private_pages
                && 
                private_pages[req.url].includes(req.session.permission)
            ) || public_pages.includes(req.url)
        )
            next()
        else
            next(createError(403)) // Forbidden
    } else {
        // Si el usuario no ha iniciado sesión, se verifica que la página es pública
        if(public_pages.includes(req.url))
            next()
        else if(req.url in private_pages)
            res.redirect('/login')
        else
            next(createError(404)) // Not found
    }
})

// Se asignan las rutas a sus funciones middleware
app.use('/', indexRouter);
app.use('/install', installRouter);
app.use("/control", controlRouter);
app.use('/login', loginRouter);
app.use('/logout', logoutRouter);
app.use('/usuarios',usuariosRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
  });
  
  // error handler
  app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
  
    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

app.listen(8080)