var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('scontro', { title: 'Scontro tra Prodotti', user: req.session?.user || null });
});

module.exports = router;
