import express from 'express';
const router = express.Router();

router.get('/', function(req, res, next) {
    res.render('contatti', { title: 'Contatti', user: req.session?.user });
});

export default router;
