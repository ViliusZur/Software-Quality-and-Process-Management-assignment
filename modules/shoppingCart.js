'use strict';

//imports
const sqlite = require('sqlite-async');

module.exports = class ShoppingCart {

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
						"totalPrice"	INTEGER
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

    async storeToShoppingCart(userID, productionID, showID, low, mid, high) {
        try{
            // get prices of single tickets and calculate the total price to pay
            let sql = `SELECT lowPrice, midPrice, highPrice FROM show
                        WHERE id = ${showID}`;
			const prices = await this.db.all(sql);   

			// if returns empty - dont store total price
			if(prices[0].lowPrice === undefined) {
				// insert values into shopping cart
				sql = `INSERT INTO shoppingCart (userID, productionID, showID, lowBooked, midBooked, highBooked)
				VALUES(${userID}, ${productionID}, ${showID}, ${low}, ${mid}, ${high})`;
				await this.db.all(sql);

				return true;

			} else {   

				const totalPrice = low * prices[0].lowPrice + mid * prices[0].midPrice + high * prices[0].highPrice;
				
				// insert values into shopping cart
				sql = `INSERT INTO shoppingCart (userID, productionID, showID, lowBooked, midBooked, highBooked, totalPrice)
						VALUES(${userID}, ${productionID}, ${showID}, ${low}, ${mid}, ${high}, ${totalPrice})`;
				await this.db.all(sql);
				return true;
			}
        } catch(err) {
            throw err;
        }
    };

    async getItems(userID) {
        if(userID === undefined) return false;

        try{
            const sql = `SELECT * FROM shoppingCart WHERE userID = ${userID}`;
            const items = await this.db.all(sql);
            
            return items;
        } catch(error) {
            throw error;
        }
    };

    async deleteItem(id) {
        try{
            const sql = `DELETE FROM shoppingCart WHERE id = ${id}`;
            await this.db.all(sql);
            return true;
        } catch(error) {
            throw error;
        }
    };
}

