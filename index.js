const express = require('express');
const AdminBro = require('admin-bro');
const options = require('./src/admin.options');
const app = express();
const logger = require('./src/helpers/logger');
const cors = require('cors');

require('dotenv').config();
const PORT = process.env.PORT || 4000;

// json
app.use(express.json());
app.enable('trust proxy');

// cors
app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
	res.setHeader(
		'Access-Control-Allow-Headers',
		'Content-Type, Authorization',
	);
	next();
});

// const corsOptions = {
// 	// origin:'https://abc.onrender.com',
// 	AccessControlAllowOrigin: '*',
// 	origin: '*',
// 	methods: 'GET,HEAD,PUT,PATCH,POST,DELETE'
//   }
// app.use(cors(corsOptions))

const admin = new AdminBro(options);

// calling database connection function
require('./src/configs/mongodb').connect();

// route importing and mounting
const user = require('./src/routes/user');
app.use('/api/v1/auth', user);
const category = require('./src/routes/category');
app.use('/api/v1/category', category);
const product = require('./src/routes/product');
app.use('/api/v1/product', product);

// const buildAdminRouter = require('./src/routes/user');
// const router = buildAdminRouter(admin);
// app.use(admin.options.rootPath, router);
app.use(express.static(__dirname + '/public'));
app.use('/uploads', express.static('uploads'));

// test api
app.get('/test', (req, res) => {
	try {
		res.status(200).json({ message: 'API is working' });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

app.listen(PORT, () => {
	logger.info('Server Started');
});
