const Category = require('../models/Category');
const ObjectId = require('mongodb').ObjectId;
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

		// get input data
		const { name } = req.body;

		// sending email for verification
		const categoryData = {
			name,
		};

		// Using mongoose
		const categoryInstance = await Category.create(categoryData);

		return res.status(200).json({
			success: true,
			message: 'category created successfully.',
			data: { category: categoryInstance },
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

		// get input data
		const { name } = req.body;

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

		const updateCategory = await categoryInstance.save();
		if (updateCategory) {
			return res.status(200).json({
				success: true,
				message: 'Category has been updated successfully',
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
		const categoryInstance = await Category.deleteOne({ _id: req.params.id });

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

		const categoryMap = {};
		categories.forEach((category) => {
			categoryMap[category._id] = category;
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
			message: `Category Delete failed: ${error.message}`,
		});
	}
};
