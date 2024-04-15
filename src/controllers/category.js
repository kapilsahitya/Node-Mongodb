const Category = require('../models/Category');
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
		// if (!req.file) {
		// 	res.status(413).send(
		// 		`File not uploaded!, Please attach jpeg file under 5 MB`,
		// 	);
		// 	return;
		// }

		// get input data
		const { name, description, products } = req.body;
		const image = req?.file?.filename;
		const categoryData = {
			name,
			description,
			image,
			products,
		};

		// Using mongoose
		const categoryInstance = await Category.create(categoryData);

		let tmpCat = {};
		tmpCat = {
			...categoryInstance._doc,
			image_url:
				req.protocol +
				'://' +
				req.get('host') +
				'/uploads/category/' +
				categoryInstance.image,
		};

		await Product.updateMany(
			{ _id: categoryInstance.products },
			{ $push: { categories: categoryInstance._id } },
		);

		return res.status(200).json({
			success: true,
			message: 'category created successfully.',
			data: { category: tmpCat },
		});
	} catch (error) {
		logger.error(error);
		res.status(500).json({
			success: false,
			message: `Category Add failed: ${error.message}`,
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
		// if (!req.file) {
		// 	res.status(413).send(
		// 		`File not uploaded!, Please attach jpeg file under 5 MB`,
		// 	);
		// 	return;
		// }

		// get input data
		const _id = req.params.id;
		const { name, description, products } = req.body;
		const categoryData = {
			name,
			description,
			products,
		};

		const category = await Category.findOne({
			$and: [
				{
					name: name,
					_id: { $ne: req.params.id },
				},
			],
		});
		if (category) {
			res.status(403).json({
				success: false,
				errors: [
					{
						type: 'field',
						msg: 'A category already exists with this name',
						path: 'name',
						location: 'body',
					},
				],
			});
		}

		const newProducts = categoryData.products || [];

		const oldCategory = await Category.findById(req.params.id);
		const oldProducts = oldCategory.products;

		Object.assign(oldCategory, categoryData);

		if (req?.file?.filename) {
			oldCategory.image = req?.file?.filename;
		}

		const newCategory = await oldCategory.save();

		const added = difference(newProducts, oldProducts);
		const removed = difference(oldProducts, newProducts);
		await Product.updateMany(
			{ _id: added },
			{ $addToSet: { categories: newCategory._id } },
		);
		await Product.updateMany(
			{ _id: removed },
			{ $pull: { categories: newCategory._id } },
		);

		tmpCat = {
			...newCategory._doc,
			image_url:
				req.protocol +
				'://' +
				req.get('host') +
				'/uploads/category/' +
				newCategory.image,
		};

		if (newCategory) {
			return res.status(200).json({
				success: true,
				message: 'Category has been updated successfully',
				data: { category: tmpCat },
			});
		} else {
			return res.status(500).json({
				success: false,
				message: 'Unable to update category',
			});
		}
	} catch (error) {
		logger.error(error);
		res.status(500).json({
			success: false,
			message: `Category Edit failed: ${error.message}`,
		});
	}
};

exports.deleteCategory = async (req, res) => {
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
		const category = await Category.findOne({ _id: req.params.id });

		const categoryInstance = await Category.deleteOne({
			_id: req.params.id,
		});

		await Product.updateMany(
			{ _id: category.products },
			{ $pull: { categories: category._id } },
		);

		if (categoryInstance) {
			return res.status(200).json({
				success: true,
				message: 'Category has been deleted successfully',
			});
		} else {
			return res.status(500).json({
				success: false,
				message: 'Unable to delete category',
			});
		}
	} catch (error) {
		logger.error(error);
		res.status(500).json({
			success: false,
			message: `Category Delete failed: ${error.message}`,
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
		const categories = await Category.find({});
		// console.log("categories", categories)

		let tmpCat = {};
		let categoryMap = [];
		categories.forEach((category) => {
			tmpCat = {
				...category._doc,
				image_url:
					req.protocol +
					'://' +
					req.get('host') +
					'/uploads/category/' +
					category.image,
			};
			// categoryMap[tmpCat._id] = tmpCat;
			categoryMap.push(tmpCat)
		});

		return res.status(200).json({
			success: true,
			message: 'Category has been fetched successfully',
			data: { categories: categoryMap },
		});
	} catch (error) {
		logger.error(error);
		res.status(500).json({
			success: false,
			message: `Category List failed: ${error.message}`,
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
