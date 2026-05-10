var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('obiettivo', { title: 'Il nostro obiettivo', user: req.session?.user || null });
});

module.exports = router;
