var express = require('express');
var router = express.Router();

function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
}

router.get('/', requireLogin, function(req, res, next) {
    res.render('contatti', { title: 'Contatti' });
});

module.exports = router;
