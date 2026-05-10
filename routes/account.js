var express = require('express');
var router = express.Router();
const db = require('../db/database');

const sql = `DELETE FROM utenti WHERE username = ? OR email = ?`;

function requireLogin(req, res, next) {

    if (!req.session.user) {
        return res.redirect('/login');
    }

    next();
}

router.get('/', requireLogin, function(req, res) {

    const user = {
        nome: req.session.user.nome,
        cognome: req.session.user.cognome,
        username: req.session.user.username,
        email: req.session.user.email,
        data_nascita: req.session.user.dataNascita,
        sesso: req.session.user.sesso,
        apiKey: ""
    };

    res.render('account', {
        title: 'Account',
        user
    });
});

router.post('/delete', requireLogin, (req, res) => {

    try {

        const stmt = db.prepare(sql);
        const result = stmt.run(
            req.session.user.username,
            req.session.user.email
        );

        // opzionale: controlla se ha eliminato qualcosa
        if (result.changes === 0) {
            return res.render('account', {
                title: 'Account',
                user: req.session.user,
                error: 'Utente non trovato'
            });
        }

        req.session.destroy(() => {
            res.redirect("/");
        });

    } catch (err) {

        console.error('Errore eliminazione account:', err.message);

        return res.render('account', {
            title: 'Account',
            user: req.session.user,
            error: 'Errore interno'
        });
    }
});

module.exports = router;