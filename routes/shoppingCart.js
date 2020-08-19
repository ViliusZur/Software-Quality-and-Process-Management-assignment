'use strict'

const Router = require('koa-router');

// importing custom modules
const paymentPage = require('../modules/payment'); // using a function from payment module
const shoppingCartPage = require('../modules/shoppingCart');
const productionsPage = require('../modules/productions'); // using a function from productions module

const router = new Router();
const dbName = 'website.db';

router.get('/shoppingCart', async ctx => {
    // retrieve shopping cart items for a specific user from database
    const shoppingCart = await new shoppingCartPage(dbName);
    const productions = await new productionsPage(dbName);
    const payment = await new paymentPage(dbName);
    const items = await shoppingCart.getItems(ctx.session.userID);

    // if shopping cart is empty - cant enter it
    if(items.length === 0) return ctx.redirect('/');

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

    // three if statements for item.length so it would display nicely on the website
    if(items.length === 1) {
        items[0].center = true;
        return ctx.render('shoppingCart', { 
            items: items,
            total: total
        });
    } else if(items.length === 2) {
        items[0].half = true;
        items[1].half = true;
        return ctx.render('shoppingCart', { 
            items: items,
            total: total
        });
    } else if(items.length === 3) {
        items[0].third = true;
        items[1].third = true;
        items[2].third = true;
        return ctx.render('shoppingCart', { 
            items: items,
            total: total
        });
    } else {
        return ctx.render('shoppingCart', { 
            items: items,
            total: total
        });
    }
});

router.post('/shoppingCart', async ctx => {
	try{
		// gather info about the sale
        const payment = await new paymentPage(dbName);
        const shoppingCart = await new shoppingCartPage(dbName);

        const date = ctx.request.body.date;
        const time = ctx.request.body.time;

        const salesInfo = {};	
		salesInfo.productionID = await payment.getProductionID(ctx.request.body.title);
		salesInfo.showID = await payment.getShowID(salesInfo.productionID, date, time);
		salesInfo.low = parseInt(ctx.request.body.low) || 0;
		salesInfo.mid = parseInt(ctx.request.body.mid) || 0;
		salesInfo.high = parseInt(ctx.request.body.high) || 0;
        
        if(salesInfo.low === 0 && salesInfo.mid === 0 && salesInfo.high === 0) 
            return ctx.redirect(
                `/tickets?date=${date}&time=${time}&id=${salesInfo.productionID}&title=${ctx.request.body.title}`
                );

		// store records to database
		await shoppingCart.storeToShoppingCart(
            ctx.session.userID,
			salesInfo.productionID, 
			salesInfo.showID, 
			salesInfo.low, 
			salesInfo.mid, 
			salesInfo.high
		);
		
		// get back to index screen
		return ctx.redirect('/');
	} catch(err) {
		console.log(err);
		await ctx.render('error', {message: err.message});
	}
});

router.post('/deleteItem', async ctx => {
    try{
        const shoppingCart = await new shoppingCartPage(dbName);
        const itemID = ctx.request.body.itemID;
        await shoppingCart.deleteItem(itemID);
        return ctx.redirect('/shoppingCart?');
    } catch(error) {
        throw error;
    }
});

module.exports = router;
