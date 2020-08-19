'use strict';

const ShoppingCart = require('../modules/shoppingCart');
const Admin = require('../modules/admin');
const Production = require('../modules/productions');

describe('storeToShoppingCart()', () => {

    test('successfully added item to shopping cart', async done => {
        expect.assertions(1);
        const shoppingCart = await new ShoppingCart();
        const admin = await new Admin();
        const production = await new Production();
        const userID = 1;
        const showID = 0;
        const productionID = 1;
        await production.addProduction(1, 'title', 'description', 'posterURL', 'shownFrom', 'shownTo');
        await admin.addShow(productionID, 'date', '12:00', 1, 2, 3);
        const result = await shoppingCart.storeToShoppingCart(userID, productionID, showID, 1, 2, 3);
        expect(result).toBe(true);
        done();
    });
});

describe('getItems()', () => {

    test('successfully got items', async done => {
        expect.assertions(1);
        const shoppingCart = await new ShoppingCart();
        const admin = await new Admin();
        const production = await new Production();
        const userID = 1;
        const showID = 0;
        const productionID = 1;
        await production.addProduction(1, 'title', 'description', 'posterURL', 'shownFrom', 'shownTo');
        await admin.addShow(productionID, 'date', '12:00', 1, 2, 3);
        await shoppingCart.storeToShoppingCart(userID, productionID, showID, 1, 2, 3);
        const items = [
            {
                id: 1,
                userID: userID,
                productionID: productionID,
                showID: showID,
                lowBooked: 1,
                midBooked: 2,
                highBooked: 3,
                totalPrice: null
            }
        ];
        const result = await shoppingCart.getItems(userID);
        expect(result).toEqual(items);
        done();
    });

    test('user undefined, receives nothing', async done => {
        expect.assertions(1);
        const shoppingCart = await new ShoppingCart();
        const admin = await new Admin();
        const production = await new Production();
        const userID = 1;
        const showID = 0;
        const productionID = 1;
        await production.addProduction(1, 'title', 'description', 'posterURL', 'shownFrom', 'shownTo');
        await admin.addShow(productionID, 'date', '12:00', 1, 2, 3);
        await shoppingCart.storeToShoppingCart(userID, productionID, showID, 1, 2, 3);
        const result = await shoppingCart.getItems();
        expect(result).toEqual(false);
        done();
    });
});

describe('deleteItem()', () => {

    test('successfully deletes an item', async done => {
        expect.assertions(1);
        const shoppingCart = await new ShoppingCart();
        const admin = await new Admin();
        const production = await new Production();
        const userID = 1;
        const showID = 0;
        const productionID = 1;
        await production.addProduction(1, 'title', 'description', 'posterURL', 'shownFrom', 'shownTo');
        await admin.addShow(productionID, 'date', '12:00', 1, 2, 3);
        await shoppingCart.storeToShoppingCart(userID, productionID, showID, 1, 2, 3);
        const result = await shoppingCart.deleteItem(1);
        expect(result).toEqual(true);
        done();
    });
});