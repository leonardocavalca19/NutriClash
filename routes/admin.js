var express = require('express');
var router = express.Router();
const db = require('../db/database');

const sql = `
    SELECT username, nome, cognome, email, dataNascita, sesso, ruolo FROM utenti
`

function requireLogin(req, res, next) {

    console.log(req.session.user.ruolo);
    if (!req.session || req.session.user.ruolo === "user") {
        return res.redirect('/');
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
router.post("/cambia-ruolo", express.json(), (req, res) => {
    try
    {
        const currentUser = req.session.user;
        if(!currentUser) {
            return res.status(401).json({
                success: false,
                error: "Non autenticato"
            });
        }

        const { username, ruolo } = req.body;
        const targetUser = db.prepare(`SELECT username, ruolo FROM utenti WHERE username = ?`).get(username);

        if(!targetUser)
        {
            return res.status(404).json({
                success: false,
                error: "Utente non trovato"
            });
        }

        if(currentUser.ruolo !== "owner" && targetUser.ruolo === "owner")
        {
            return res.status(403).json({
                success: false,
                error: "Non autorizzato"
            });
        }

        if(currentUser.username === username)
        {
            return res.status(403).json({
                success: false,
                error: "Non puoi modificare il tuo ruolo"
            });
        }
        db.prepare(`UPDATE utenti SET ruolo = ? WHERE username = ?`).run(ruolo, username);
        res.json({
            success: true
        });
    }
    catch (err)
    {
        console.error(err);
        res.status(500).json({
            success: false,
            error: "Errore server"
        });
    }
});

module.exports = router;