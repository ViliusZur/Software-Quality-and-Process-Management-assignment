'use strict';

const Payment = require('../modules/payment');
const User = require('../modules/user');
const Production = require('../modules/productions');

describe('getCardDetails()', () => {

    test('successfully getting card details', async done => {
        expect.assertions(1);
        const user = await new User();
        const payment = await new Payment();
        await user.register('user', 'password', 'user@email.com');
        await user.registerCard('user', '1111111111111111', '12/2030');
        const result = await payment.getCardDetails('user');
        expect(result).toEqual([]);
        done();
    });

    test('not getting details without sending username', async done => {
        expect.assertions(1);
        const user = await new User();
        const payment = await new Payment();
        await user.register('user', 'password', 'user@email.com');
        await user.registerCard('user', '1111111111111111', '12/2030');
        const result = await payment.getCardDetails();
        expect(result).toEqual(false);
        done();
    });

    test('not getting details with username that does not exist', async done => {
        expect.assertions(1);
        const user = await new User();
        const payment = await new Payment();
        await user.register('user', 'password', 'user@email.com');
        await user.registerCard('user', '1111111111111111', '12/2030');
        const result = await payment.getCardDetails('bad');
        expect(result).toEqual([]);
        done();
    });
});

describe('getProductionID', () => {

    test('successfully get production id', async done => {
        expect.assertions(1);
        const production = await new Production();
        const payment = await new Payment();
        await production.addProduction(1, 'title', 'description', 'posterURL', 'shownFrom', 'shownTo');
        const result = await payment.getProductionID('title');
        expect(result).toBe(1);
        done();
    });
});
