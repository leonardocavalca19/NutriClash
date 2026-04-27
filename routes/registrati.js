var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('registrati', { title: 'Registrazione' });
});

router.post('/', function(req, res, next) {
  const { nome, cognome, sesso, dataNascita, email, password, confermaPassword } = req.body;
  console.log('Dati ricevuti:', { nome, cognome, sesso, dataNascita, email, password, confermaPassword });

  res.redirect('/username'); 
});

module.exports = router;
