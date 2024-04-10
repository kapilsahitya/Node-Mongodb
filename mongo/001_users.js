db = db.getSiblingDB('node-mongodb');
db.createUser({
	user: 'admin',
	pwd: 'password',
	roles: [
		{
			role: 'readWrite',
			db: 'node-mongodb',
		},
	],
});
