const Product = require('../models/Product');
const logger = require('../helpers/logger');
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

		// check whether req.file contians the file
		// if not multer is failed to parse so notify the client
		if (!req.file) {
			res.status(413).send(
				`File not uploaded!, Please attach jpeg file under 5 MB`,
			);
			return;
		}

		// get input data
		const { name, description } = req.body;
		const image = req?.file?.filename;

		// sending email for verification
		const productData = {
			name,
			description,
			image,
		};

		// Using mongoose
		const productInstance = await Product.create(productData);

		let tmpCat = {};
		tmpCat = {
			...updateProduct._doc,
			image_url:
				req.protocol +
				'://' +
				req.get('host') +
				'/uploads/product/' +
				productInstance.image,
		};

		return res.status(200).json({
			success: true,
			message: 'product created successfully.',
			data: { product: tmpCat },
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

		// check whether req.file contians the file
		// if not multer is failed to parse so notify the client
		if (!req.file) {
			res.status(413).send(
				`File not uploaded!, Please attach jpeg file under 5 MB`,
			);
			return;
		}

		// get input data
		const { name, description } = req.body;

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

		// Using mongoose
		const productInstance = await Product.findById(req.params.id);
		productInstance.name = name;
		productInstance.description = description;
		if (req?.file?.filename) {
			productInstance.image = req?.file?.filename;
		}

		const updateProduct = await productInstance.save();
		let tmpCat = {};
		tmpCat = {
			...updateProduct._doc,
			image_url:
				req.protocol +
				'://' +
				req.get('host') +
				'/uploads/product/' +
				updateProduct.image,
		};

		if (updateProduct) {
			return res.status(200).json({
				success: true,
				message: 'Product has been updated successfully',
				data: { product: tmpCat },
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

		// Using mongoose
		const productInstance = await Product.deleteOne({
			_id: req.params.id,
		});

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

		// Using mongoose
		const categories = await Product.find({});

		let tmpCat = {};
		let productMap = {};
		categories.forEach((product) => {
			tmpCat = {
				...product._doc,
				image_url:
					req.protocol +
					'://' +
					req.get('host') +
					'/uploads/product/' +
					product.image,
			};
			productMap[tmpCat._id] = tmpCat;
		});

		return res.status(200).json({
			success: true,
			message: 'Product has been fetched successfully',
			data: { categories: productMap },
		});
	} catch (error) {
		logger.error(error);
		res.status(500).json({
			success: false,
			message: `Product List failed: ${error.message}`,
		});
	}
};
