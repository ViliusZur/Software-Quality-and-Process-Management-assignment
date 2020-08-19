'use strict';

//imports
const sqlite = require('sqlite-async');

module.exports = class Payment {

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

    async getCardDetails(username) {
        if(username === undefined) return false;
        try{
            const sql = `SELECT cardNumber, expiryDate FROM cardPaymentDetails 
                         WHERE username = "${username}"`;
            const cardDetails = await this.db.all(sql);
            
            return cardDetails;
        } catch(error) {
            console.log(error);
            return false;
        }
   };

   async getProductionID(title) {
       try{
            const sql = `SELECT id FROM production 
                            WHERE title = "${title}"`;
            const productionID = await this.db.all(sql);
            const id = productionID[0].id;

            return id;
       } catch(err) {
           throw err;
       }
   }

    async getShowID(productionID, date, time) {
        try{
            const sql = `SELECT id FROM show 
                        WHERE productionID = ${productionID} AND date = "${date}" AND timeFrom = "${time}"`;
            const showID = await this.db.all(sql);

            return showID[0].id;
        } catch(err) {
            throw err;
        }
    };

    async getShowByID(id) {
        try{
            const sql = `SELECT * FROM show WHERE id = ${id}`;
            const show = await this.db.all(sql);
            return show;
        } catch(error) {
            throw error;
        }
    }

    async storeSales(item) {
        try{
            // get todays date
            const today = new Date();
            const dd = String(today.getDate()).padStart(2, '0');
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const yyyy = today.getFullYear();

            const date = mm + '/' + dd + '/' + yyyy;

            // get current time
            const time = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
            
            // get price of the seats and calculate income
            let sql = `SELECT lowPrice, midPrice, highPrice FROM show
                        WHERE id = ${item.showID}`;
            const prices = await this.db.all(sql);         
            const income = item.lowBooked * prices[0].lowPrice + item.midBooked * prices[0].midPrice + item.highBooked * prices[0].highPrice;

            // insert values to database
            sql = `INSERT INTO sales 
                    VALUES("${date}", "${time}", ${item.productionID}, ${item.showID}, 
                            ${item.lowBooked}, ${item.midBooked}, ${item.highBooked}, ${income})`;
            await this.db.all(sql);

            // delete items from shopping cart
            sql = `DELETE FROM shoppingCart WHERE id = ${item.id}`;
            await this.db.all(sql);

            return;
        } catch(err) {
            throw err;
        }
    };

    // reduce the number of available seats for a show
    async reduceSeats(item, show) {
        try{
            const low = show[0].lowSeatsLeft - item.lowBooked;
            const mid = show[0].midSeatsLeft - item.midBooked;
            const high = show[0].highSeatsLeft - item.highBooked;
            
            const sql = `UPDATE show SET lowSeatsLeft = ${low}, midSeatsLeft = ${mid}, highSeatsLeft = ${high} 
                        WHERE id = ${item.showID}`;
            await this.db.all(sql);
            return;
        } catch(error) {
            throw error;
        }
    }
}

