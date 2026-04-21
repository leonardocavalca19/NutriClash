var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('username', { title: 'Username' });
});

router.post('/', function(req, res, next) {
  const { username } = req.body;
  console.log('Dati ricevuti:', { username });

  res.redirect('/login'); 
});

module.exports = router;
