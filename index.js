import AdminJS from 'adminjs';
import express from 'express';
import AdminJSExpress from '@adminjs/express';
import { Database, Resource } from '@adminjs/mongoose';
// import options from './src/admin.options';
// import { info } from './src/helpers/logger';
// import logger from './src/helpers/logger';
import cors from 'cors';
// import user from './src/routes/user.js';
import category from './src/routes/category.js';
import product from './src/routes/product.js';
import { Category } from './src/models/Category.js';
import { Product } from './src/models/Product.js';
// require('dotenv').config();
import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config();
const PORT = process.env.PORT || 4000;
import path from 'node:path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

AdminJS.registerAdapter({
	Database,
	Resource,
});

const start = async () => {
	const app = express();

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
	await mongoose.connect(process.env.DATABASE_URL, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	const admin = new AdminJS({
		resources: [
			{
				resource: Category,
			},
			{
				resource: Product,
			}
		],
	});

	const adminRouter = AdminJSExpress.buildRouter(admin);
	app.use(admin.options.rootPath, adminRouter);

	// calling database connection function
	// require('./src/configs/mongodb').connect();

	// app.use('/api/v1/auth', user);
	app.use('/api/v1/category', category);
	app.use('/api/v1/product', product);
	app.use(express.static(__dirname + '/public'));
	app.use('/uploads', express.static('uploads'));

	app.get('/test', (req, res) => {
		try {
			res.status(200).json({ message: 'API is working' });
		} catch (error) {
			res.status(500).json({ message: error.message });
		}
	});

	app.listen(PORT, () => {
		console.log('Server Started');
	});
};

start();

// const corsOptions = {
// 	// origin:'https://abc.onrender.com',
// 	AccessControlAllowOrigin: '*',
// 	origin: '*',
// 	methods: 'GET,HEAD,PUT,PATCH,POST,DELETE'
//   }
// app.use(cors(corsOptions))
