import createError from 'http-errors';
import express from 'express';
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import fs from "fs";
import session from "express-session";
import { supabase } from "./db/supabase.js";
import dotenv from "dotenv";

if(!process.env.RENDER) dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

const hostname = '127.0.0.1';
const port = 3000;

import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';
import registratiRouter from './routes/registrati.js';
import loginRouter from './routes/login.js';
import nutriscoreRouter from './routes/nutriscore.js';
import gameRouter from './routes/game.js';
import scontroRouter from './routes/scontro.js';
import contattiRouter from './routes/contatti.js';
import privacyRouter from './routes/privacy.js';
import accountRouter from './routes/account.js';
import classificaRouter from './routes/classifica.js';
import apiRouter from './routes/api.js';
import imageCacheRouter from './routes/imageCache.js';
import adminRouter from './routes/admin.js';

const app = express();

app.use(session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

app.use(function(req, res, next) {
 	res.locals.user = req.session.user || null; // Questo rende la variabile "user" disponibile in tutti i file .ejs
	next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/registrati', registratiRouter);
app.use('/login', loginRouter);
app.use('/game', gameRouter);
app.use('/nutriscore', nutriscoreRouter);
app.use('/scontro', scontroRouter);
app.use('/contatti', contattiRouter);
app.use('/privacy', privacyRouter);
app.use('/account', accountRouter);
app.use('/classifica', classificaRouter);
app.use('/api', apiRouter);
app.use("/cached-images", imageCacheRouter);
app.use("/admin", adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

export default app;