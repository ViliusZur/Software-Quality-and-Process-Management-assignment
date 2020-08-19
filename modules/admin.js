'use strict';

//imports
const sqlite = require('sqlite-async');

module.exports = class Admin {

	constructor(dbName = ':memory:') {
		return (async() => {
			this.db = await sqlite.open(dbName);
			// we need this table to store the user accounts
			let sql = `CREATE TABLE IF NOT EXISTS "users" (
							"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
							"username"	TEXT NOT NULL UNIQUE,
							"password"	TEXT NOT NULL,
							"pictureURL"	TEXT UNIQUE,
							"email"	TEXT NOT NULL UNIQUE,
							"admin"	INTEGER
						);`;
			await this.db.run(sql);
			sql = `CREATE TABLE IF NOT EXISTS "cardPaymentDetails" (
						"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
						"userID"	INTEGER NOT NULL UNIQUE,
						"username"	TEXT NOT NULL UNIQUE,
						"cardNumber"	INTEGER NOT NULL UNIQUE,
						"expiryDate"	INTEGER NOT NULL
					);`;
			await this.db.run(sql);		
			sql = `CREATE TABLE IF NOT EXISTS "production" (
						"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
						"title"	TEXT NOT NULL,
						"description"	TEXT NOT NULL,
						"posterURL"	TEXT,
						"shownFrom"	TEXT NOT NULL,
						"shownTo"	TEXT NOT NULL
					);`;
			await this.db.run(sql);	
			sql = `CREATE TABLE IF NOT EXISTS "sales" (
						"date"	TEXT NOT NULL,
						"time"	TEXT NOT NULL,
						"productionID"	INTEGER NOT NULL,
						"showID"	INTEGER NOT NULL,
						"lowTicketsSold"	INTEGER,
						"midTicketsSold"	INTEGER,
						"highTicketsSold"	INTEGER,
						"income"	INTEGER NOT NULL
					);`;	
			await this.db.run(sql);	
			sql = `CREATE TABLE IF NOT EXISTS "shoppingCart" (
						"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
						"userID"	INTEGER NOT NULL,
						"productionID"	INTEGER NOT NULL,
						"showID"	INTEGER NOT NULL,
						"lowBooked"	INTEGER NOT NULL,
						"midBooked"	INTEGER NOT NULL,
						"highBooked"	INTEGER NOT NULL,
						"totalPrice"	INTEGER NOT NULL
					);`;	
			await this.db.run(sql);	
			sql = `CREATE TABLE IF NOT EXISTS "show" (
						"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
						"date"	INTEGER NOT NULL,
						"productionID"	INTEGER NOT NULL,
						"timeFrom"	TEXT NOT NULL,
						"timeTo"	TEXT NOT NULL,
						"lowSeatsLeft"	INTEGER,
						"midSeatsLeft"	INTEGER,
						"highSeatsLeft"	INTEGER,
						"lowPrice"	INTEGER NOT NULL,
						"midPrice"	INTEGER NOT NULL,
						"highPrice"	INTEGER NOT NULL
					);`;
			await this.db.run(sql);	
			return this;
		})()
	};
    
    async getProductionSales(productionID) {
        try{
            const sql = `SELECT lowTicketsSold, midTicketsSold, highTicketsSold, income FROM sales
                        WHERE productionID = ${productionID}`;
            const results = await this.db.all(sql);
            
            // iterate through results and add up low mid and high sales
            const sales = {};
            sales.low = 0;
            sales.mid = 0;
            sales.high = 0;
            sales.income = 0;
            for(let i = 0; i < results.length; i++) {
                sales.low = sales.low + results[i].lowTicketsSold;
                sales.mid = sales.mid + results[i].midTicketsSold;
                sales.high = sales.high + results[i].highTicketsSold;
                sales.income = sales.income + results[i].income;
            }
            
            return sales;
        } catch(error) {
            throw error;
        }
    };

    async getShowSales(productionID) {
        try{
            const sql = `SELECT showID, lowTicketsSold, midTicketsSold, highTicketsSold, income FROM sales
                        WHERE productionID = ${productionID}`;
            const results = await this.db.all(sql);

            // iterate through results and add up shows with same id
            const sales = [];
            const showIDs = [];
            for(let i = 0; i < results.length; i++) {
                if(!showIDs.includes(results[i].showID)) {
                    // if encountered a new showID - add a new show object to array
                    showIDs.push(results[i].showID);
                    sales.push({
                        showID: results[i].showID,
                        low: results[i].lowTicketsSold,
                        mid: results[i].midTicketsSold,
                        high: results[i].highTicketsSold,
                        income: results[i].income,
                    });
                } else {
                    // adding values to the last object in array
                    sales[sales.length-1].low = sales[sales.length-1].low + results[i].lowTicketsSold;
                    sales[sales.length-1].mid = sales[sales.length-1].mid + results[i].midTicketsSold;
                    sales[sales.length-1].high = sales[sales.length-1].high + results[i].highTicketsSold;
                    sales[sales.length-1].income = sales[sales.length-1].income + results[i].income;
                }
            }
            return sales;
        } catch(error) {
            throw error;
        }
    };

    async addShow(productionID, date, timeFrom, lowPrice, midPrice, highPrice) {
        try{
            // assign maximum number of available seats 
            const lowAvailableSeats = 50;
            const midAvailableSeats = 30;
            const highAvailableSeats = 20;  
            let timeTo;

            // assign timeTo
            if(timeFrom === '12:00') timeTo = '14:00';
            if(timeFrom === '16:00') timeTo = '18:00';
            if(timeFrom === '20:00') timeTo = '22:00';

            // insert into DB
            const sql = `INSERT INTO show 
                        (date, productionID, timeFrom, timeTo, 
                            lowSeatsLeft, midSeatsLeft, highSeatsLeft, 
                            lowPrice, midPrice, highPrice)
                        VALUES("${date}", ${productionID}, "${timeFrom}", "${timeTo}", 
                                ${lowAvailableSeats}, ${midAvailableSeats}, ${highAvailableSeats}, 
                                ${lowPrice}, ${midPrice}, ${highPrice})`;
            await this.db.all(sql);
            return true;
        } catch(error) {
            throw error;
        }
    };

};

