import express from 'express';
const router = express.Router();

router.get('/', function(req, res, next) {
	res.render('privacy', { title: 'Privacy', user: req.session?.user || null });
});

export default router;
