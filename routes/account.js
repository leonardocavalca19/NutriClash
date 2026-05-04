var express = require('express');
var router = express.Router();
const datiUtente = {
        nome: "Mario",
        cognome: "Rossi",
        username: "mario_nutri",
        email: "mario@email.it",
        data_nascita: "01/01/2000",
        sesso: "M"
    };


router.get('/', function(req, res, next) {
  res.render('account', { title: 'Account', user: datiUtente });
});


//TODO: aggiungere i dati dell'account

module.exports = router;
