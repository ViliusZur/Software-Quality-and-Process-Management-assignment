'use strict'

const Router = require('koa-router');

// importing custom modules
const ticketPage = require('../modules/tickets');
const productions = require('../modules/productions');

const router = new Router();
const dbName = 'website.db';

router.get('/tickets', async ctx => {
	try {
		// get the booking info from browser link
        const bookingInfo = {};
        bookingInfo.productionID = ctx.request.query.id;
		bookingInfo.title = ctx.request.query.title;
		bookingInfo.date = ctx.request.query.date;
        bookingInfo.time = ctx.request.query.time;
       
        // get production and show details
        const tickets = await new ticketPage(dbName);
        const production = await new productions(dbName);
        const productionResults = await production.getProductionByID(bookingInfo.productionID);
        const showResults = await tickets.getShowDetails(bookingInfo.productionID, bookingInfo.date, bookingInfo.time);
        productionResults[0].posterURL = '../public/productionPosters/' + productionResults[0].posterURL;
        
        return ctx.render('tickets', {
            production: productionResults[0],
            show: showResults[0]
        });
	} catch(err) {
        console.log(err)
		await ctx.render('error', {message: err.message});
	}
});

module.exports = router;
