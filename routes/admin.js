'use strict'

const Router = require('koa-router');

// importing custom modules
const Production = require('../modules/productions');
const Payment = require('../modules/payment');
const Admin = require('../modules/admin');

const router = new Router();
const dbName = 'website.db';

router.get('/admin', async ctx => {
	try {
        // get the titles of all productions
        const production = await new Production(dbName);
        const titles = await production.getProductions();
        
        return ctx.render('admin', { 
            income: false,
            addShows: false,
            titles: titles 
        });
	} catch(err) {
		await ctx.render('error', {message: err.message});
	}
});

router.get('/income', async ctx => {
    try{
        const production = await new Production(dbName);
        const payment = await new Payment(dbName);
        const admin = await new Admin(dbName);

        // get the titles of all productions
        const titles = await production.getProductions();

        // get production id      
        const productionTitle = ctx.request.query.production;
        const productionID = await payment.getProductionID(productionTitle);
        
        // get shows for this production
        const shows = await production.getShows(productionID);

        // get production sales from DB
        const productionSales = await admin.getProductionSales(productionID);

        // iterate through shows and add sales for all shows for a specific production
        const showSalesResults = await admin.getShowSales(productionID);
        const showSales = [];
        for(let i = 0; i < shows.length; i++) {
            showSales.push({
                id: shows[i].id,
                date: shows[i].date,
                timeFrom: shows[i].timeFrom,
                timeTo: shows[i].timeTo,
                low: 0,
                mid: 0,
                high: 0,
                income: 0,
            })
            for(let u = 0; u < showSalesResults.length; u++) {
                if(shows[i].id === showSalesResults[u].showID) {
                    showSales[i].low = showSales[i].low + showSalesResults[u].low;
                    showSales[i].mid = showSales[i].mid + showSalesResults[u].mid;
                    showSales[i].high = showSales[i].high + showSalesResults[u].high;
                    showSales[i].income = showSales[i].income + showSalesResults[u].income;
                }
            }
        }

        return ctx.render('admin', { 
            income: true,
            addShows: false,
            titles: titles,
            productionTitle: productionTitle,
            productionSales: productionSales,
            showSales: showSales 
        });
    } catch(error) {
        throw error;
    }
});

router.get('/addShows', async ctx => {
    try{
        const production = await new Production(dbName);

        // get the titles of all productions
        const titles = await production.getProductions();

        // get production title and number of shows to add
        const productionTitle = ctx.request.query.production;
        const numberOfShows = ctx.request.query.numOfShows;

        // iterate numberOfShows and add them to an object so {{#each }} would work
        const numberOfShowsObject = {};
        for(let i = 0; i < numberOfShows; i++) {
            numberOfShowsObject[i] = i;
        }
        
        return ctx.render('admin', {
            income: false,
            addShows: true,
            titles: titles,
            productionTitle: productionTitle,
            numberOfShowsObject: numberOfShowsObject,
            numberOfShows: numberOfShows
        });
    } catch(error) {
        throw error;
    }
});

router.post('/addShows', async ctx => {
    try{
        const admin = await new Admin(dbName);
        const payment = await new Payment(dbName);

        // get info from body
        const numberOfShows = ctx.request.body.numberOfShows;
        const dates = ctx.request.body.date;
        const times = ctx.request.body.time;
        const lowPrices = ctx.request.body.low;
        const midPrices = ctx.request.body.mid;
        const highPrices = ctx.request.body.high;
        const productionTitle = ctx.request.body.productionTitle;
        const productionID = await payment.getProductionID(productionTitle);


        // iterate through entries and add them to show table
        for(let i = 0; i < numberOfShows; i++) {
            await admin.addShow(productionID, dates[i], times[i], lowPrices[i], midPrices[i], highPrices[i]);
        }

        return ctx.redirect('/admin');
    } catch(error) {
        throw error;
    }
});
module.exports = router;
