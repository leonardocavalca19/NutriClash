var express = require('express');
var router = express.Router();
const db = require('../db/database');
const sql = `DELETE FROM utenti WHERE username = ? OR email = ?`;

const datiUtente = {
        nome: "",
        cognome: "",
        username: "",
        email: "",
        data_nascita: "",
        sesso: ""
    };

function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/login');
    } else {
        datiUtente.nome = req.session.user.nome;
        datiUtente.cognome = req.session.user.cognome;
        datiUtente.username = req.session.user.username;
        datiUtente.email = req.session.user.email;
        datiUtente.data_nascita = req.session.user.dataNascita;
        datiUtente.sesso = req.session.user.sesso;

        console.log(datiUtente);
    }
    next();
}

router.get('/', requireLogin, function(req, res, next) {
    res.render('account', { title: 'Account', user: datiUtente });
});

router.get('/delete', (req, res) => {
    db.get(sql, [datiUtente.username, datiUtente.email], function(err, row) {
        if (err) {
            console.error('Errore durante la cancellazione dell\'account:', err);
            return res.render('account', { title: 'Account', user: datiUtente, error: 'Errore interno' });
        }
        if (!row) {
            return res.render('account', { title: 'Account', user: datiUtente, error: 'Utente non trovato' });
        }
    });
        
    req.session.destroy(() => {
        res.redirect("/");
    });
});




module.exports = router;
