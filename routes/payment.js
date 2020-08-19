'use strict'

const Router = require('koa-router');
const PDFDocument = require('pdf-creator-node');
const fs = require('fs');
const mailer = require('nodemailer');

// importing custom modules
const paymentPage = require('../modules/payment'); 
const shoppingCartPage = require('../modules/shoppingCart'); // using a function from payment module
const productionsPage = require('../modules/productions'); // using a function from productions module

const router = new Router();
const dbName = 'website.db';

router.get('/payment', async ctx => {
	try {
		// get the booking info from shopping cart table in database
		const shoppingCart = await new shoppingCartPage(dbName);
		const payment = await new paymentPage(dbName);
		const productions = await new productionsPage(dbName);
		const items = await shoppingCart.getItems(ctx.session.userID);
		let show;
		let production;

		// for loop to add production title, show date and time to each item
		// also calculating the total price of the cart
		let total = 0;
		for(let i = 0; i < items.length; i++) {
			show = await payment.getShowByID(items[i].showID);
			production = await productions.getProductionByID(items[i].productionID);
			items[i].title = production[0].title;
			items[i].date = show[0].date;
			items[i].time = show[0].timeFrom;
			total = total + items[i].totalPrice;
		}

		// check if user has registered card details
        const cardDetails = await payment.getCardDetails(ctx.session.user);
		
		// so many if statements for item.length so it would display nicely on the website
		if(cardDetails.length < 1) {
			if(items.length === 1) {
				items[0].center = true;
				return ctx.render('payment', {
					cardRegistered: false,
					total: total,
					items: items
				});
			}
			if(items.length === 2) {
				items[0].half = true;
				items[1].half = true;
				return ctx.render('payment', {
					cardRegistered: false,
					total: total,
					items: items
				});
			}
			if(items.length === 3) {
				items[0].third = true;
				items[1].third = true;
				items[2].third = true;
				return ctx.render('payment', {
					cardRegistered: false,
					total: total,
					items: items
				});
			}
			return ctx.render('payment', {
				cardRegistered: false,
				total: total,
				items: items
			});
		} else {
			if(items.length === 1) {
				items[0].center = true;
				return ctx.render('payment', {
					cardRegistered: true,
					cardNumber: cardDetails[0].cardNumber,
					expiryDate: cardDetails[0].expiryDate,
					total: total,
					items: items
				});
			}
			if(items.length === 2) {
				items[0].half = true;
				items[1].half = true;
				return ctx.render('payment', {
					cardRegistered: true,
					cardNumber: cardDetails[0].cardNumber,
					expiryDate: cardDetails[0].expiryDate,
					total: total,
					items: items
				});
			}
			if(items.length === 3) {
				items[0].third = true;
				items[1].third = true;
				items[2].third = true;
				return ctx.render('payment', {
					cardRegistered: true,
					cardNumber: cardDetails[0].cardNumber,
					expiryDate: cardDetails[0].expiryDate,
					total: total,
					items: items
				});
			}
			return ctx.render('payment', {
				cardRegistered: true,
				cardNumber: cardDetails[0].cardNumber,
				expiryDate: cardDetails[0].expiryDate,
				total: total,
				items: items
			});
		}
	} catch(err) {
        console.log(err)
		await ctx.render('error', {message: err.message});
	}
});

// finish when be doing advanced tasks
router.post('/payment', async ctx => {
	try{
		const shoppingCart = await new shoppingCartPage(dbName);
		const payment = await new paymentPage(dbName);
		const productions = await new productionsPage(dbName);

		/* 
			Generate a PDF file with the summary of the sale.
			In this section we get todays date and current time,
			with this we create a unique PDF file for user.
			Then we read the template and add sale summary to 
			PDF file using that template
		*/ 
		// get html template for PDF file
		const HTML = fs.readFileSync('./public/PDFs/template.html', 'utf8');
		
		/*
			Here we retrieve all items that will be baught.
			sum up the total price, set options for PDF file, 
			create a document object that we will pass to template
		*/
		// retrieve items
		const saleItems = await shoppingCart.getItems(ctx.session.userID);
		let show;
		let production;

		// for loop to add production title, show date and time to each item
		// also calculating the total price of the cart
		let total = 0;
		for(let i = 0; i < saleItems.length; i++) {
			show = await payment.getShowByID(saleItems[i].showID);
			production = await productions.getProductionByID(saleItems[i].productionID);
			saleItems[i].title = production[0].title;
			saleItems[i].date = show[0].date;
			saleItems[i].time = show[0].timeFrom;
			total = total + saleItems[i].totalPrice;
		}
		
		// getting date and time for sale information
		const today = new Date();
		const dd = String(today.getDate()).padStart(2, '0');
		const mm = String(today.getMonth() + 1).padStart(2, '0');
		const yyyy = today.getFullYear();
		const date = yyyy + '/' + mm + '/' + dd;
		// get current time
		const time = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();

		// setting options and creating document object
		const options = { format: 'A4', orientation: 'portrait', border: '10mm' };
		const document = {
			html: HTML,
			data: {
				username: ctx.session.user,
				date: date,
				time: time,
				items: saleItems,
				total: total
			},
			path: './public/PDFs/sale.pdf'
		};

		// creating a PDF file and writting to it
		await PDFDocument.create(document, options)
			.then(res => {
				console.log('PDF created');
			})
			.catch(error => {
				console.error(error);
			});
		
		/*
			When everything is written to PDF, we send that PDF to users e-mail
		*/

		const trans = await mailer.createTransport({
		service: 'gmail',
		auth: {
			user: '340cttest@gmail.com',
			pass: '340ctTestemail'
		}
		});
		
		const mailOp ={
		from: '340cttest@gmail.com',
		to: ctx.session.email,
		subject: 'Your receit',
		html: '<h1>Thank you for booking!</h1>',
		attachments: [
			{
			path: './public/PDFs/sale.pdf'
			}
		]
		};
		
		await trans.sendMail(mailOp, (err, info) => {
		if(err) {
			console.log(err);
		} else {
			console.log('Email sent: ' + info.response);
		}
		});
		/*
			User receives the e-mail and we continue - store sale details to database
			and reduce available seats
		*/
		// get shopping cart items
		const items = await shoppingCart.getItems(ctx.session.userID);

		// store records to database
		// and reduce the number of available seats
		let showDetails;
		for(let i = 0; i < items.length; i++) {
			showDetails = await payment.getShowByID(items[i].showID);
			await payment.storeSales(items[i]);
			await payment.reduceSeats(items[i], showDetails);
		}

		// get back to index screen
		return ctx.redirect('/');
	} catch(err) {
		console.log(err);
		await ctx.render('error', {message: err.message});
	}
});

module.exports = router;
