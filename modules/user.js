'use strict';

const bcrypt = require('bcrypt-promise');
const mime = require('mime-types');
const sqlite = require('sqlite-async');
const fs = require('fs-extra');
const validator = require('email-validator');
const saltRounds = 10

module.exports = class User {

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

	async register(user, pass, email) {
		try {
			// check for missing username, password or email
			if(user.length === 0) throw new Error('missing username');
			if(pass.length === 0) throw new Error('missing password');
			if(email.length === 0) throw new Error('missing e-mail');
			// check if email is valid
			if (validator.validate(email) === false) throw new Error('e-mail is invalid');

			// check if username is unique
			let sql = `SELECT COUNT(id) as records FROM users WHERE username="${user}";`;
			let data = await this.db.get(sql);
			if(data.records !== 0) throw new Error(`username "${user}" already in use`);
			// check if email is unique
			sql = `SELECT COUNT(id) as records FROM users WHERE email="${email}";`;
			data = await this.db.get(sql);
			if(data.records !== 0) throw new Error(`email "${email}" already in use`);

			// hash the password and create a user
			pass = await bcrypt.hash(pass, saltRounds);
			sql = `INSERT INTO users(username, password, email) VALUES("${user}", "${pass}", "${email}")`;
			await this.db.run(sql);

			return true;
		} catch(err) {
			throw err;
		}
	};

	async registerCard(user, cardNum, expDate) {
		try {
			// check for missing card number or expDate
			if(cardNum.length === 0) return false;
			if(expDate.length === 0) return false;

			// check formats
			const format = await this.checkCardFormat(cardNum, expDate);
			if(format === false) return false;
			
			// check if card number is unique
			let sql = `SELECT * FROM cardPaymentDetails WHERE cardNumber = ${cardNum}`;
			const data = await this.db.get(sql);
			if(data !== undefined) return false;
			
			const userID = await this.getUserID(user);
			sql = `INSERT INTO cardPaymentDetails(userID, username, cardNumber, expiryDate) 
				   VALUES(${userID}, "${user}", "${cardNum}", "${expDate}")`;
			await this.db.run(sql);
			
			return true;
		} catch(err) {
			throw err;
		}
	};

	async checkCardFormat(cardNum, expDate) {

		// check if card number is 16 numbers long and if expiry date string is 7 characters long
		if(cardNum.length !== 16) return false;
		if(expDate.length !== 7) return false;

		// get todays month and year
		const today = new Date();
		let mm = String(today.getMonth() + 1).padStart(2, '0');
		let yyyy = today.getFullYear();
		mm = parseInt(mm);
		yyyy = parseInt(yyyy);

		// get month and year from expiry date and check if the date is not in the past
		let expDateMM = expDate.charAt(0) + expDate.charAt(1);
		let expDateYYYY = expDate.charAt(3) + expDate.charAt(4) + expDate.charAt(5) + expDate.charAt(6);
		expDateMM = parseInt(expDateMM);
		expDateYYYY = parseInt(expDateYYYY);

		if(expDateMM <= mm) {
			if(expDateYYYY <= yyyy) return false;
		}
		if(expDateYYYY < yyyy) return false;

		// check if expiry date format is correct
		const correctDateFormat = expDate.includes('/', 2);
		if(correctDateFormat === false) return false;

		return true;
	}

	async uploadPicture(path, mimeType, username) {
		const extension = mime.extension(mimeType);
		await fs.copy(path, `public/avatars/${username}.${extension}`);
		try{
			const sql = `UPDATE users SET pictureURL = '${username}.${extension}' WHERE username = '${username}'`;
			await this.db.all(sql);
			return;
		} catch(error) {
			throw error;
		}
	};

	async login(username, password) {
		try {
			// check if username exists
			let sql = `SELECT count(id) AS count FROM users WHERE username = "${username}";`;
			const records = await this.db.get(sql);
			if(!records.count) throw new Error(`username "${username}" not found`);
			// compare passwords for the usernme
			sql = `SELECT password FROM users WHERE username = "${username}";`;
			const record = await this.db.get(sql);
			const valid = await bcrypt.compare(password, record.password);
			if(valid === false) throw new Error(`invalid password for account "${username}"`);			
			return true;
		} catch(err) {
			throw err;
		}
	};

	async getUserID(username) {
		try {
			const sql = `SELECT id FROM users WHERE username = "${username}"`;
			const record = await this.db.get(sql);
			const id = record.id;
			
			return id;
		} catch(err) {
			throw err;
		}
	};
	
	async checkIfAdmin(id) {
		try{
			const sql = `SELECT admin FROM users WHERE id = ${id}`;
			const admin = await this.db.get(sql);
			
			if(admin.admin === null) return false;
			return true;
		} catch(error) {
			throw error;
		}
	};

	async getEmail(id) {
		try{
			const sql = `SELECT email FROM users WHERE id = ${id}`;
			let email = await this.db.all(sql);
			email = email[0].email;
			return email;
		} catch(error) {
			throw error;
		}
	}
}
