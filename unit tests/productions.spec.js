'use strict';

const Production = require('../modules/productions');
const Admin = require('../modules/admin');

describe('addProduction()', () => {

    test('successfully add a production', async done => {
        expect.assertions(1);
		const production = await new Production();
		const result = await production.addProduction(1, 'title', 'description', 'posterURL', 'shownFrom', 'shownTo');
		expect(result).toBe(true);
		done();
    });

    test('error while adding a production without id', async done => {
        expect.assertions(1);
        const production = await new Production();
        const result = await production.addProduction('title', 'description', 'posterURL', 'shownFrom', 'shownTo');
		expect(result).toBe(false);
		done();
    });
});

describe('getProduction()', () => {
    
    test('successfully retrieved a production', async done => {
        expect.assertions(1);
        const production = await new Production();
        await production.addProduction(1, 'title', 'description', 'posterURL', 'shownFrom', 'shownTo');
        const productions = [{
            id: 1,
            title: 'title',
            description: 'description',
            posterURL: 'posterURL',
            shownFrom: 'shownFrom',
            shownTo: 'shownTo'
        }];
        const result = await production.getProductions();
        expect(result).toEqual(productions);
        done();
    });

    test('successfully retrieved 5 productions', async done => {
        expect.assertions(1);
        const production = await new Production();
        await production.addProduction(1, 'title', 'description', 'posterURL', 'shownFrom', 'shownTo');
        await production.addProduction(2, 'title', 'description', 'posterURL', 'shownFrom', 'shownTo');
        await production.addProduction(3, 'title', 'description', 'posterURL', 'shownFrom', 'shownTo');
        await production.addProduction(4, 'title', 'description', 'posterURL', 'shownFrom', 'shownTo');
        await production.addProduction(5, 'title', 'description', 'posterURL', 'shownFrom', 'shownTo');
        const productions = [
            {
                id: 1,
                title: 'title',
                description: 'description',
                posterURL: 'posterURL',
                shownFrom: 'shownFrom',
                shownTo: 'shownTo'
            },
            {
                id: 2,
                title: 'title',
                description: 'description',
                posterURL: 'posterURL',
                shownFrom: 'shownFrom',
                shownTo: 'shownTo'
            },
            {
                id: 3,
                title: 'title',
                description: 'description',
                posterURL: 'posterURL',
                shownFrom: 'shownFrom',
                shownTo: 'shownTo'
            },
            {
                id: 4,
                title: 'title',
                description: 'description',
                posterURL: 'posterURL',
                shownFrom: 'shownFrom',
                shownTo: 'shownTo'
            },
            {
                id: 5,
                title: 'title',
                description: 'description',
                posterURL: 'posterURL',
                shownFrom: 'shownFrom',
                shownTo: 'shownTo'
            }
        ];
        const result = await production.getProductions();
        expect(result).toEqual(productions);
        done();
    });
});

describe('getProductionByID()', () => {

    test('successfully retrieve production', async done => {
        expect.assertions(1);
        const production = await new Production();
        await production.addProduction(1, 'title', 'description', 'posterURL', 'shownFrom', 'shownTo');
        const productions = [{
            id: 1,
            title: 'title',
            description: 'description',
            posterURL: 'posterURL',
            shownFrom: 'shownFrom',
            shownTo: 'shownTo'
        }];
        const result = await production.getProductionByID(1);
        expect(result).toEqual(productions);
        done();
    });

    test('unsuccessfully retrieve production (id not found)', async done => {
        expect.assertions(1);
        const production = await new Production();
        await production.addProduction(1, 'title', 'description', 'posterURL', 'shownFrom', 'shownTo');
        const productions = [];
        const result = await production.getProductionByID(2);
        expect(result).toEqual(productions);
        done();
    });
});

describe('getShows()', () => {

    test('successfully retrieve shows (no shows in database)', async done => {
        expect.assertions(1);
        const production = await new Production();
        const result = await production.getShows(1);
        expect(result).toEqual([]);
        done();
    });

    test('successfully retrieve shows', async done => {
        expect.assertions(1);
        const production = await new Production();
        const admin = await new Admin();
        await production.addProduction(1, 'title', 'description', 'posterURL', 'shownFrom', 'shownTo');
        await admin.addShow(1, 'date', '12:00', 1, 2, 3);
        await admin.addShow(1, 'date', '16:00', 2, 3, 4);
        await admin.addShow(1, 'date', '20:00', 3, 4, 5);
        const shows = [
            {
                id: 1,
                date: 'date',
                productionID: 1,
                timeFrom: '12:00',
                timeTo: '14:00',
                lowSeatsLeft: 50,
                midSeatsLeft: 30,
                highSeatsLeft: 20,
                lowPrice: 1,
                midPrice: 2,
                highPrice: 3
            },
            {
                id: 2,
                date: 'date',
                productionID: 1,
                timeFrom: '16:00',
                timeTo: '18:00',
                lowSeatsLeft: 50,
                midSeatsLeft: 30,
                highSeatsLeft: 20,
                lowPrice: 2,
                midPrice: 3,
                highPrice: 4
            },
            {
                id: 3,
                date: 'date',
                productionID: 1,
                timeFrom: '20:00',
                timeTo: '22:00',
                lowSeatsLeft: 50,
                midSeatsLeft: 30,
                highSeatsLeft: 20,
                lowPrice: 3,
                midPrice: 4,
                highPrice: 5
            }
        ];
        const result = await production.getShows(1);
        expect(result).toEqual([]);
        done();
    });
});
