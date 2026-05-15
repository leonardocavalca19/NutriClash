import express from 'express';
const router = express.Router();

router.get('/', function(req, res, next) {
  res.render('nutriscore', { title: 'Nutriscore', user: req.session?.user });
});

export default router;
