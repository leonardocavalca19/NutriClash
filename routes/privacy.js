var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('privacy', { title: 'Privacy', user: req.session?.user || null });
});

module.exports = router;
