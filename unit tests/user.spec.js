'use strict';

const Accounts = require('../modules/user.js');

describe('register()', () => {

	test('register a valid account', async done => {
		expect.assertions(1);
		const account = await new Accounts();
		const register = await account.register('doej', 'password', 'email@gmail.com');
		expect(register).toBe(true);
		done();
	});

	test('register a duplicate username', async done => {
		expect.assertions(1);
		const account = await new Accounts();
		await account.register('doej', 'password', 'email@gmail.com');
		await expect( account.register('doej', 'password', 'email@gmail.com') )
			.rejects.toEqual( Error('username "doej" already in use') );
		done();
	});

	test('register a duplicate email', async done => {
		expect.assertions(1);
		const account = await new Accounts();
		await account.register('doej', 'password', 'email@gmail.com');
		await expect( account.register('doej2', 'password', 'email@gmail.com') )
			.rejects.toEqual( Error('email "email@gmail.com" already in use') );
		done();
	})

	test('error if blank username', async done => {
		expect.assertions(1);
		const account = await new Accounts();
		await expect( account.register('', 'password', 'email@gmail.com') )
			.rejects.toEqual( Error('missing username') );
		done();
	})

	test('error if blank password', async done => {
		expect.assertions(1);
		const account = await new Accounts();
		await expect( account.register('doej', '', 'email@gmail.com') )
			.rejects.toEqual( Error('missing password') );
		done();
	})

	test('error if blank email', async done => {
		expect.assertions(1);
		const account = await new Accounts();
		await expect( account.register('doej', 'password', '') )
			.rejects.toEqual( Error('missing e-mail') );
		done();
	})

	test('error if invalid email', async done => {
		expect.assertions(1);
		const account = await new Accounts();
		await expect( account.register('doej', 'password', 'email.com') )
			.rejects.toEqual( Error('e-mail is invalid') );
		done();
	})

})

describe('registerCard()', () => {

	test('card is successfully registered', async done => {
		expect.assertions(1);
		const account = await new Accounts();
		await account.register('user', 'password', 'user@email.com');
		const registerCard = await account.registerCard('user', '1111111111111111', '12/2030');
		expect(registerCard).toBe(true);
		done();
	});

	test('card number not provided', async done => {
		expect.assertions(1);
		const account = await new Accounts();
		await account.register('user', 'password', 'user@email.com');
		const registerCard = await account.registerCard('user', '', '12/2030');
		expect(registerCard).toBe(false);
		done();
	});

	test('expiry date not provided', async done => {
		expect.assertions(1);
		const account = await new Accounts();
		await account.register('user', 'password', 'user@email.com');
		const registerCard = await account.registerCard('user', '1234567891234567', '');
		expect(registerCard).toBe(false);
		done();
	});

	test('card number too short', async done => {
		expect.assertions(1);
		const account = await new Accounts();
		await account.register('user', 'password', 'user@email.com');
		const registerCard = await account.registerCard('user', '123456', '12/2030');
		expect(registerCard).toBe(false);
		done();
	});

	test('expiry date too short', async done => {
		expect.assertions(1);
		const account = await new Accounts();
		await account.register('user', 'password', 'user@email.com');
		const registerCard = await account.registerCard('user', '1111111111111111', '1/2030');
		expect(registerCard).toBe(false);
		done();
	});

	test('expiry date in the past (year)', async done => {
		expect.assertions(1);
		const account = await new Accounts();
		await account.register('user', 'password', 'user@email.com');
		const registerCard = await account.registerCard('user', '1111111111111111', '12/2010');
		expect(registerCard).toBe(false);
		done();
	});

	test('expiry date in the past (month)', async done => {
		expect.assertions(1);
		const account = await new Accounts();
		await account.register('user', 'password', 'user@email.com');
		const registerCard = await account.registerCard('user', '1111111111111111', '01/2019');
		expect(registerCard).toBe(false);
		done();
	});

	test('expiry date in the past (year and month)', async done => {
		expect.assertions(1);
		const account = await new Accounts();
		await account.register('user', 'password', 'user@email.com');
		const registerCard = await account.registerCard('user', '1111111111111111', '01/2010');
		expect(registerCard).toBe(false);
		done();
	});

	test('wrong expiry date format', async done => {
		expect.assertions(1);
		const account = await new Accounts();
		await account.register('user', 'password', 'user@email.com');
		const registerCard = await account.registerCard('user', '1111111111111111', '12-2030');
		expect(registerCard).toBe(false);
		done();
	});


	test('card number is not unique', async done => {
		expect.assertions(1);
		const account = await new Accounts();
		await account.register('user1', 'password', 'user1@email.com');
		await account.register('user2', 'password', 'user2@email.com');
		await account.registerCard('user1', '1111111111111111', '12/2030');
		const registerCard = await account.registerCard('user2', '1111111111111111', '12/2030');
		expect(registerCard).toBe(false);
		done();
	});


});

/*
describe('uploadPicture()', () => {
	// this would have to be done by mocking the file system
	// perhaps using mock-fs?
})
*/
describe('login()', () => {
	test('log in with valid credentials', async done => {
		expect.assertions(1);
		const account = await new Accounts();
		await account.register('user', 'password', 'user@email.com');
		const valid = await account.login('user', 'password');
		expect(valid).toBe(true);
		done();
	});

	test('invalid username', async done => {
		expect.assertions(1);
		const account = await new Accounts();
		await account.register('user', 'password', 'user@email.com');
		await expect( account.login('bad', 'password') )
			.rejects.toEqual( Error('username "bad" not found') );
		done();
	});

	test('invalid password', async done => {
		expect.assertions(1);
		const account = await new Accounts();
		await account.register('user', 'password', 'user@email.com');
		await expect( account.login('user', 'bad') )
			.rejects.toEqual( Error('invalid password for account "user"') );
		done();
	});

});

describe('checkIfAdmin()', () => {

	test('not an admin', async done => {
		expect.assertions(1);
		const account = await new Accounts();
		await account.register('user', 'password', 'user@email.com');
		const id = await account.getUserID('user');
		const admin = await account.checkIfAdmin(id);
		expect(admin).toBe(false);
		done();
	});
});

describe('getEmil()', () => {

	test('returns users email', async done => {
		expect.assertions(1);
		const account = await new Accounts();
		await account.register('user', 'password', 'user@email.com');
		const id = await account.getUserID('user');
		const email = await account.getEmail(id);
		expect(email).toBe('user@email.com');
		done();
	});
});
