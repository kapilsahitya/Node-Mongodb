const Category = require('../models/Category');
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
			res
				.status(413)
				.send(`File not uploaded!, Please attach jpeg file under 5 MB`);
			return;
		}

		// get input data
		const { name, description } = req.body;
		const image = req?.file?.filename;

		// sending email for verification
		const categoryData = {
			name,
			description,
			image,
		};

		// Using mongoose
		const categoryInstance = await Category.create(categoryData);

		let tmpCat = {};
		tmpCat = {
			...updateCategory._doc,
			image_url:
				req.protocol +
				'://' +
				req.get('host') +
				'/uploads/category/' +
				categoryInstance.image,
		};

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
		if (!req.file) {
			res
				.status(413)
				.send(`File not uploaded!, Please attach jpeg file under 5 MB`);
			return;
		}

		// get input data
		const { name, description } = req.body;

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

		// Using mongoose
		const categoryInstance = await Category.findById(req.params.id);
		categoryInstance.name = name;
		categoryInstance.description = description;
		if (req?.file?.filename) {
			categoryInstance.image = req?.file?.filename;
		}

		const updateCategory = await categoryInstance.save();
		let tmpCat = {};
		tmpCat = {
			...updateCategory._doc,
			image_url:
				req.protocol +
				'://' +
				req.get('host') +
				'/uploads/category/' +
				updateCategory.image,
		};

		if (updateCategory) {
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
		const categoryInstance = await Category.deleteOne({
			_id: req.params.id,
		});

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

		let tmpCat = {};
		let categoryMap = {};
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
			categoryMap[tmpCat._id] = tmpCat;
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
