const path = require('path');
const fs = require('fs-extra');
const Product = require('../models/Product');
const Category = require('../models/Category');
const logger = require('../helpers/logger');
const extract = require('extract-zip');
const { validationResult } = require('express-validator');
require('dotenv').config();

exports.add = async (req, res) => {
	try {
		const errors = validationResult(req);

		// if there is error then return Error
		if (!errors.isEmpty()) {
			return res.status(403).json({
				success: false,
				errors: errors.array(),
			});
		}

		// get input data
		const { name, description, categories } = req.body;
		const image = req?.file?.filename;
		const productData = {
			name,
			description,
			image,
			categories,
		};

		// Model Action Handeler
		const product = await Product.create(productData);
		const productInstance = await Product.findById(product._id).populate(
			'categories',
		);

		// create object for returning
		let tmpPrd = {};
		let tmpCat = {};
		let categoryMap = [];
		tmpPrd = {
			...productInstance._doc,
			image_url:
				req.protocol +
				'://' +
				req.get('host') +
				'/uploads/product/' +
				productInstance.image,
		};
		if (
			tmpPrd.game_path !== '' &&
			fs.existsSync(
				__dirname + '../../../uploads/product/game/' + tmpPrd.game_path,
			)
		) {
			tmpPrd.game_path_url =
				req.protocol +
				'://' +
				req.get('host') +
				'/uploads/product/game/' +
				tmpPrd.game_path +
				'/index.html';
		}

		tmpPrd.categories.forEach((category) => {
			tmpCat = {
				...category._doc,
				image_url:
					req.protocol +
					'://' +
					req.get('host') +
					'/uploads/category/' +
					category.image,
			};
			categoryMap.push(tmpCat);
		});
		tmpPrd.categories = categoryMap;

		await Category.updateMany(
			{ _id: productInstance.categories },
			{ $push: { products: productInstance._id } },
		);

		return res.status(200).json({
			success: true,
			message: 'product created successfully.',
			data: { product: tmpPrd },
		});
	} catch (error) {
		logger.error(error);
		res.status(500).json({
			success: false,
			message: `Product Add failed: ${error.message}`,
		});
	}
};

exports.edit = async (req, res) => {
	try {
		const errors = validationResult(req);

		// if there is error then return Error
		if (!errors.isEmpty()) {
			return res.status(403).json({
				success: false,
				errors: errors.array(),
			});
		}

		// get input data
		const { name, description, categories } = req.body;
		const productData = {
			name,
			description,
			categories,
		};

		const product = await Product.findOne({
			$and: [
				{
					name: name,
					_id: { $ne: req.params.id },
				},
			],
		});
		if (product) {
			res.status(403).json({
				success: false,
				errors: [
					{
						type: 'field',
						msg: 'A product already exists with this name',
						path: 'name',
						location: 'body',
					},
				],
			});
		}

		const newCategories = productData.categories || [];

		const oldProduct = await Product.findById(req.params.id);
		const oldCategories = oldProduct.categories;

		Object.assign(oldProduct, productData);

		if (req?.file?.filename) {
			oldProduct.image = req?.file?.filename;
		}

		const saveProduct = await oldProduct.save();
		const newProduct = await Product.findById(saveProduct._id).populate(
			'categories',
		);

		const added = difference(newCategories, oldCategories);
		const removed = difference(oldCategories, newCategories);
		await Category.updateMany(
			{ _id: added },
			{ $addToSet: { products: newProduct._id } },
		);
		await Category.updateMany(
			{ _id: removed },
			{ $pull: { products: newProduct._id } },
		);

		// create object for returning
		let tmpPrd = {};
		let tmpCat = {};
		let categoryMap = [];
		tmpPrd = {
			...newProduct._doc,
			image_url:
				req.protocol +
				'://' +
				req.get('host') +
				'/uploads/product/' +
				newProduct.image,
		};
		if (
			tmpPrd.game_path !== '' &&
			fs.existsSync(
				__dirname + '../../../uploads/product/game/' + tmpPrd.game_path,
			)
		) {
			tmpPrd.game_path_url =
				req.protocol +
				'://' +
				req.get('host') +
				'/uploads/product/game/' +
				tmpPrd.game_path +
				'/index.html';
		}

		tmpPrd.categories.forEach((category) => {
			tmpCat = {
				...category._doc,
				image_url:
					req.protocol +
					'://' +
					req.get('host') +
					'/uploads/category/' +
					category.image,
			};

			categoryMap.push(tmpCat);
		});
		tmpPrd.categories = categoryMap;

		if (newProduct) {
			return res.status(200).json({
				success: true,
				message: 'Product has been updated successfully',
				data: { product: tmpPrd },
			});
		} else {
			return res.status(500).json({
				success: false,
				message: 'Unable to update product',
			});
		}
	} catch (error) {
		logger.error(error);
		res.status(500).json({
			success: false,
			message: `Product Edit failed: ${error.message}`,
		});
	}
};

exports.deleteProduct = async (req, res) => {
	try {
		const errors = validationResult(req);

		// if there is error then return Error
		if (!errors.isEmpty()) {
			return res.status(403).json({
				success: false,
				errors: errors.array(),
			});
		}

		// Model Action Handeler
		const product = await Product.findOne({ _id: req.params.id });

		const productInstance = await Product.deleteOne({
			_id: req.params.id,
		});

		await Category.updateMany(
			{ _id: product.categories },
			{ $pull: { products: product._id } },
		);

		if (productInstance) {
			return res.status(200).json({
				success: true,
				message: 'Product has been deleted successfully',
			});
		} else {
			return res.status(500).json({
				success: false,
				message: 'Unable to delete product',
			});
		}
	} catch (error) {
		logger.error(error);
		res.status(500).json({
			success: false,
			message: `Product Delete failed: ${error.message}`,
		});
	}
};

exports.getAll = async (req, res) => {
	try {
		const errors = validationResult(req);

		// if there is error then return Error
		if (!errors.isEmpty()) {
			return res.status(403).json({
				success: false,
				errors: errors.array(),
			});
		}

		// Model Action Handeler
		const products = await Product.find({}).populate('categories');

		// create object for returning
		let tmpCat = {};
		let tmpPrd = {};
		let productMap = [];
		let categoryMap = [];
		products.forEach((product) => {
			categoryMap = [];
			tmpPrd = {
				...product._doc,
				image_url:
					req.protocol +
					'://' +
					req.get('host') +
					'/uploads/product/' +
					product.image,
			};

			if (
				tmpPrd.game_path !== '' &&
				fs.existsSync(
					__dirname +
						'../../../uploads/product/game/' +
						tmpPrd.game_path,
				)
			) {
				tmpPrd.game_path_url =
					req.protocol +
					'://' +
					req.get('host') +
					'/uploads/product/game/' +
					tmpPrd.game_path +
					'/index.html';
			}
			tmpPrd.categories.forEach((category) => {
				tmpCat = {
					...category._doc,
					image_url:
						req.protocol +
						'://' +
						req.get('host') +
						'/uploads/category/' +
						category.image,
				};

				categoryMap.push(tmpCat);
			});
			tmpPrd.categories = categoryMap;

			productMap.push(tmpPrd);
		});

		return res.status(200).json({
			success: true,
			message: 'Product has been fetched successfully',
			data: { products: productMap },
		});
	} catch (error) {
		logger.error(error);
		res.status(500).json({
			success: false,
			message: `Product List failed: ${error.message}`,
		});
	}
};

exports.gameUpload = async (req, res) => {
	try {
		const errors = validationResult(req);

		// if there is error then return Error
		if (!errors.isEmpty()) {
			return res.status(403).json({
				success: false,
				errors: errors.array(),
			});
		}

		// check whether req.file contians the file
		// if not multer is failed to parse so notify the client
		if (!req.file) {
			res.status(413).send(
				`File not uploaded!, Please attach jpeg file under 5 MB`,
			);
			return;
		}

		const gameDirectory = path.parse(req.file.filename).name;
		const gameDirectoryPath =
			__dirname + '../../../uploads/product/game/' + gameDirectory;
		await extract(
			__dirname + '../../../uploads/product/game/' + req.file.filename,
			{
				dir: path.resolve(gameDirectoryPath),
			},
		);
		fs.readdirSync(gameDirectoryPath).forEach((mainFile) => {
			if (mainFile !== 'index.html') {
				fs.readdirSync(gameDirectoryPath + '/' + mainFile).forEach(
					(file) => {
						fs.move(
							gameDirectoryPath + '/' + mainFile + '/' + file,
							gameDirectoryPath + '/' + file,
							{ mkdirp: true },
						);
					},
				);
			}
		});

		const oldProduct = await Product.findById(req.params.id);
		if (fs.existsSync(gameDirectoryPath)) {
			oldProduct.game_path = gameDirectory;
		}
		await oldProduct.save();
		const newProduct = await Product.findById(req.params.id).populate(
			'categories',
		);

		// create object for returning
		let tmpPrd = {};
		let tmpCat = {};
		let categoryMap = [];
		tmpPrd = {
			...newProduct._doc,
			image_url:
				req.protocol +
				'://' +
				req.get('host') +
				'/uploads/product/' +
				newProduct.image,
		};
		if (
			fs.existsSync(
				__dirname +
					'../../../uploads/product/game/' +
					newProduct.game_path,
			)
		) {
			tmpPrd.game_path_url =
				req.protocol +
				'://' +
				req.get('host') +
				'/uploads/product/game/' +
				newProduct.game_path +
				'/index.html';
		}

		tmpPrd.categories.forEach((category) => {
			tmpCat = {
				...category._doc,
				image_url:
					req.protocol +
					'://' +
					req.get('host') +
					'/uploads/category/' +
					category.image,
			};
			categoryMap.push(tmpCat);
		});
		tmpPrd.categories = categoryMap;

		return res.status(200).json({
			success: true,
			message: 'Game has been successfully uploaded.',
			data: { product: tmpPrd },
		});
	} catch (error) {
		logger.error(error);
		res.status(500).json({
			success: false,
			message: `Game Upload failed: ${error.message}`,
		});
	}
};

exports.getById = async (req, res) => {
	try {
		const errors = validationResult(req);

		// if there is error then return Error
		if (!errors.isEmpty()) {
			return res.status(403).json({
				success: false,
				errors: errors.array(),
			});
		}

		const newProduct = await Product.findById(req.params.id).populate(
			'categories',
		);

		// create object for returning
		let tmpPrd = {};
		let tmpCat = {};
		let categoryMap = [];
		tmpPrd = {
			...newProduct._doc,
			image_url:
				req.protocol +
				'://' +
				req.get('host') +
				'/uploads/product/' +
				newProduct.image,
		};
		if (
			tmpPrd.game_path !== '' &&
			fs.existsSync(
				__dirname + '../../../uploads/product/game/' + tmpPrd.game_path,
			)
		) {
			tmpPrd.game_path_url =
				req.protocol +
				'://' +
				req.get('host') +
				'/uploads/product/game/' +
				tmpPrd.game_path +
				'/index.html';
		}

		tmpPrd.categories.forEach((category) => {
			tmpCat = {
				...category._doc,
				image_url:
					req.protocol +
					'://' +
					req.get('host') +
					'/uploads/category/' +
					category.image,
			};
			categoryMap.push(tmpCat);
		});
		tmpPrd.categories = categoryMap;

		if (newProduct) {
			return res.status(200).json({
				success: true,
				message: 'Product has been fetched successfully',
				data: { product: tmpPrd },
			});
		} else {
			return res.status(500).json({
				success: false,
				message: 'Unable to fetch product',
			});
		}
	} catch (error) {
		logger.error(error);
		res.status(500).json({
			success: false,
			message: `Product Get by Id failed: ${error.message}`,
		});
	}
};

function difference(A, B) {
	const arrA = Array.isArray(A) ? A.map((x) => x.toString()) : [A.toString()];
	const arrB = Array.isArray(B) ? B.map((x) => x.toString()) : [B.toString()];

	const result = [];
	for (const p of arrA) {
		if (arrB.indexOf(p) === -1) {
			result.push(p);
		}
	}

	return result;
}
