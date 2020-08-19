'use strict'

const Router = require('koa-router');

// importing custom modules
const productions = require('../modules/productions');

const router = new Router();
const dbName = 'website.db';

/**
 * The secure home page.
 *
 * @name Home Page
 * @route {GET} /
 * @authentication This route requires cookie-based authentication.
 */

router.get('/production', async ctx => {
    const productionID = parseInt(ctx.request.query.id);
	try {
		// get selected production from database
        const production = await new productions(dbName);
        const productionResults = await production.getProductionByID(productionID);
        const showResults = await production.getShows(productionID);
		const posterURL = '../public/productionPosters/' + productionResults[0].posterURL;

        // assign showResults to arrays
        const id = [];
        const date = [];
        const timeFrom = [];
        const timeTo = [];
        const lowSeats = [];
        const midSeats = [];
        const highSeats = [];
        const lowPrice = [];
        const midPrice = [];
        const highPrice = [];

        for(let i = 0; i < showResults.length; i++) {
            id.push(showResults[i].id);
            date.push(showResults[i].date);
            timeFrom.push(showResults[i].timeFrom);
            timeTo.push(showResults[i].timeTo);
            lowSeats.push(showResults[i].lowSeatsLeft);
            midSeats.push(showResults[i].midSeatsLeft);
            highSeats.push(showResults[i].highSeatsLeft);
            lowPrice.push(showResults[i].lowPrice);
            midPrice.push(showResults[i].midPrice);
            highPrice.push(showResults[i].highPrice);
        }
        
        // there are multiple dates for the same show, we reduce it to one
        const showDates = [];
        showDates.push(showResults[0].date);
        for(let i = 0; i < showResults.length; i++) {
            if(!showDates.includes(showResults[i].date)) {
                showDates.push(showResults[i].date);
            }
        }
                
		return ctx.render('production', {
            productionID: productionResults[0].id,
            title: productionResults[0].title, 
            description: productionResults[0].description, 
            posterURL: posterURL,
            shownFrom: productionResults[0].shownFrom,
            shownTo: productionResults[0].shownTo,

            show: showResults,
            showDates: showDates
        });

	} catch(err) {
        console.log(err)
		await ctx.render('error', {message: err.message});
	}
});

module.exports = router;
