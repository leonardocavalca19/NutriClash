import express from 'express';
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('scontro', { title: 'Scontro tra Prodotti', user: req.session?.user || null });
});

export default router;
