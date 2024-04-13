const mongoose = require('mongoose');
const logger = require('../helpers/logger');

require('dotenv').config();
exports.connect = () => {
	mongoose
		.connect(process.env.DATABASE_URL, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		})
		.then(() => logger.info('Server StartedDB Connected Successfully.'))
		.catch((error) => {
			logger.error('this error occured' + error);
			process.exit(1);
		});
};
// C:\Program Files\MongoDB\Server\7.0\bin
