var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('login', { title: 'Login' });
});

module.exports = router;

router.post('/', function(req, res, next) {
  const { email, password } = req.body;
  console.log('Dati ricevuti:', { email, password });

  res.redirect('/login'); //TODO: sostituire con la pagina di destinazione dopo il login, ad esempio /dashboard
});