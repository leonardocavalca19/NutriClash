var express = require('express');
var router = express.Router();

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
        datiUtente.dataNascita = req.session.user.dataNascita;
        datiUtente.nome = req.session.user.nome;
    }
    next();
}

router.get('/', requireLogin, function(req, res, next) {
    res.render('account', { title: 'Account', user: datiUtente });
});


//TODO: aggiungere i dati dell'account

module.exports = router;
