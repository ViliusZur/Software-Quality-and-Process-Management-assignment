#!/usr/bin/env node

//Routes File

'use strict';

/* MODULE IMPORTS */
const Koa = require('koa')
const Router = require('koa-router');
const views = require('koa-views');
const staticDir = require('koa-static');
const bodyParser = require('koa-bodyparser');
const koaBody = require('koa-body')({multipart: true, uploadDir: '.'});
const session = require('koa-session');
const serve = require('koa-static');
const mount = require('koa-mount');
//const jimp = require('jimp')

//custom imports
const home = require('./routes/home');
const production = require('./routes/production');
const payment = require('./routes/payment');
const tickets = require('./routes/tickets');
const shoppingCart = require('./routes/shoppingCart');
const admin = require('./routes/admin');

const app = new Koa();
const router = new Router();

/* CONFIGURING THE MIDDLEWARE */
app.keys = ['darkSecret'];
app.use(mount('/public', serve('./public')));
app.use(bodyParser());
app.use(session(app));
app.use(views(`${__dirname}/views`, { extension: 'handlebars' }, {map: { handlebars: 'handlebars' }}));

const defaultPort = 3001;
const port = process.env.PORT || defaultPort;


app.use(home.routes());
app.use(production.routes());
app.use(payment.routes());
app.use(tickets.routes());
app.use(shoppingCart.routes());
app.use(admin.routes());
app.use(router.routes());

app.listen(port, async() => console.log(`listening on port ${port}`));
