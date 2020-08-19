'use strict'

const Router = require('koa-router');
const koaBody = require('koa-body')({multipart: true, uploadDir: '.'});

// importing custom modules
const User = require('../modules/user');
const productions = require('../modules/productions');
const shoppingCartPage = require('../modules/shoppingCart');

const router = new Router();
const dbName = 'website.db';

/**
 * The secure home page.
 *
 * @name Home Page
 * @route {GET} /
 * @authentication This route requires cookie-based authentication.
 */

router.get('/', async ctx => {
	try {
		// get currently running productions from database
		const production = await new productions(dbName);
		const shoppingCart = await new shoppingCartPage(dbName);
		const results = await production.getProductions();
		// renaming path to poster
		for(let i = 0; i < results.length; i++) {
			results[i].posterURL = '../public/productionPosters/' + results[i].posterURL;
		}
		const shoppingCartItems = await shoppingCart.getItems(ctx.session.userID);
		const numOfShoppingItems = shoppingCartItems.length;

		// transfering upcomming productions to a different variable
		const upcommingProductions = [];
		for(let i = 1; i < results.length; i++) {
			upcommingProductions.push(results[i]);
		}

		// render index if not logged in
    	if(ctx.session.authorised !== true) {
			return ctx.render('index', {
				loggedin: false,
				id: results[0].id,
				title: results[0].title, 
				description: results[0].description, 
				posterURL: results[0].posterURL,
				shownFrom: results[0].shownFrom,
				shownTo: results[0].shownTo,

				upcommingProductions: upcommingProductions
			});
		}

		const data = {};
		if(ctx.query.msg) data.msg = ctx.query.msg; 
		
		// render index if logged in
		await ctx.render('index', {
			loggedin: true,
			userID: ctx.session.userID,
			username: ctx.session.user,
			admin: ctx.session.admin,
			numOfShoppingItems: numOfShoppingItems,
			id: results[0].id,
			title: results[0].title, 
			description: results[0].description, 
			posterURL: results[0].posterURL,
			shownFrom: results[0].shownFrom,
			shownTo: results[0].shownTo,

			upcommingProductions: upcommingProductions
		});

	} catch(err) {
		await ctx.render('error', {message: err.message});
	}
});

/**
 * The user registration page.
 *
 * @name Register Page
 * @route {GET} /register
 */
router.get('/register', async ctx => await ctx.render('register'));

/**
 * The script to process new user registrations.
 *
 * @name Register Script
 * @route {POST} /register
 */
router.post('/register', koaBody, async ctx => {
	try {
		// extract the data from the request
		const body = ctx.request.body;
		const {path, type} = ctx.request.files.avatar;

		// call the functions in the module
		const user = await new User(dbName);
		await user.register(body.user, body.pass, body.email);
		await user.registerCard(body.user, body.cardNum, body.expDate);
		await user.uploadPicture(path, type, body.user);
		
		// redirect to the home page
		ctx.redirect(`/?msg=new user "${body.user}" added`);

	} catch(err) {
		await ctx.render('error', {message: err.message});
	}
});

router.get('/login', async ctx => {
	const data = {}
	if(ctx.query.msg) data.msg = ctx.query.msg;
	if(ctx.query.user) data.user = ctx.query.user;
	await ctx.render('login', data);
});

router.post('/login', async ctx => {
	try {
		const body = ctx.request.body;
		const user = await new User(dbName);
		await user.login(body.user, body.pass);

		ctx.session.authorised = true;
		ctx.session.user = body.user;
		ctx.session.userID = await user.getUserID(body.user, body.pass);
		ctx.session.admin = await user.checkIfAdmin(ctx.session.userID);
		ctx.session.email = await user.getEmail(ctx.session.userID);
		
		return ctx.redirect('/?msg=you are now logged in');
	} catch(err) {
		await ctx.render('error', {message: err.message});
	}
});

router.get('/logout', async ctx => {
	ctx.session.authorised = null;
	ctx.redirect('/?msg=you are now logged out');
});

module.exports = router;
