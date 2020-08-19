'use strict';

//imports
const sqlite = require('sqlite-async');

module.exports = class Production {

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
						"posterURL"	TEXT NOT NULL,
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

	async addProduction(id, title, description, posterURL, shownFrom, shownTo) {
		try{
			const sql = `INSERT INTO production (id, title, description, posterURL, shownFrom, shownTo)
							VALUES (${id}, "${title}", "${description}", "${posterURL}", "${shownFrom}", "${shownTo}")`;
			await this.db.all(sql);
			return true;
		} catch(error) {
			return false;
		}
	}

    // get the most recent production from database
    async getProductions() {
        try{
            const sql = 'SELECT * FROM production ORDER BY id ASC LIMIT 7';
            const productions = await this.db.all(sql);
            return productions;
        } catch(error) {
            throw error;
        }
    };

    async getProductionByID(id) {
        try{
            const sql = `SELECT * FROM production 
                         WHERE id = ${id}`;
            const production = await this.db.all(sql);
            return production;
        } catch(error) {
            throw error;
        }
    };

    async getShows(productionID) {
        try{
            const sql = `SELECT * FROM show 
                         WHERE productionID = ${productionID}`;
            const shows = await this.db.all(sql);
            
            return shows;
        } catch(error) {
            throw error;
        }
    }
}

