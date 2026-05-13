var express = require('express');
var router = express.Router();
const db = require('../db/database');

const sql = `
    SELECT username, nome, cognome, email, dataNascita, sesso, ruolo FROM utenti
`

function requireLogin(req, res, next) {

    if (!req.session && req.session.user.ruolo === "user") {
        return res.redirect('/login');
    }

    next();
}

/* GET home page. */
router.get('/', requireLogin, function(req, res, next) {

    const stmt = db.prepare(sql);
    const rows = stmt.all();

    try
    {
        res.render("admin", { title: "Amministratore", user: req.session.user, users: rows });
    }
    catch (error)
    {
        console.error("Errore index:", err.message);
        res.render('index', {
            title: 'Home',
            user: req.session?.user || null,
            img_url: "/images/not-available.png"
        });
    }
});

module.exports = router;