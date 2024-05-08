// const path = require('path');
// const fs = require('fs-extra');
// const Category = require('../models/Category');
// const Product = require('../models/Product');
// const logger = require('../helpers/logger');
// const { validationResult } = require('express-validator');
import path from 'path';
import fs from 'fs-extra';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import logger from '../helpers/logger.js';
import { validationResult } from 'express-validator';
// require('dotenv').config();

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

export const add = async (req, res) => {
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
		const { name, description, products } = req.body;
		const image = req?.file?.filename;
		const categoryData = {
			name,
			description,
			image,
			products,
		};

		// Model Action Handeler
		const category = await Category.create(categoryData);
		const categoryInstance = await Category.findById(category._id).populate(
			'products',
		);

		// create object for returning
		let tmpPrd = {};
		let tmpCat = {};
		let productMap = [];
		tmpCat = {
			...categoryInstance._doc,
			image_url: '',
		};
		if (
			categoryInstance.image !== '' &&
			fs.existsSync(
				__dirname +
					'../../../uploads/category/' +
					categoryInstance.image,
			)
		) {
			tmpCat.image_url =
				req.protocol +
				'://' +
				req.get('host') +
				'/uploads/category/' +
				categoryInstance.image;
		}
		tmpCat.products.forEach((product) => {
			tmpPrd = {
				...product._doc,
				image_url: '',
			};
			if (
				product.image !== '' &&
				fs.existsSync(
					__dirname + '../../../uploads/product/' + product.image,
				)
			) {
				tmpCat.image_url =
					req.protocol +
					'://' +
					req.get('host') +
					'/uploads/product/' +
					product.image;
			}

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

			productMap.push(tmpPrd);
		});
		tmpCat.products = productMap;

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

export const edit = async (req, res) => {
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

		const oldCategory = await Category.findById(req.params.id);
		const oldProducts = oldCategory.products;
		const newProducts = categoryData.products || oldCategory.products;
		categoryData.products = newProducts;

		Object.assign(oldCategory, categoryData);

		if (req?.file?.filename) {
			oldCategory.image = req?.file?.filename;
		}

		const saveCategory = await oldCategory.save();
		const newCategory = await Category.findById(saveCategory._id).populate(
			'products',
		);

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

		// create object for returning
		let tmpPrd = {};
		let tmpCat = {};
		let productMap = [];
		tmpCat = {
			...newCategory._doc,
			image_url: '',
		};
		if (
			newCategory.image !== '' &&
			fs.existsSync(
				__dirname + '../../../uploads/category/' + newCategory.image,
			)
		) {
			tmpCat.image_url =
				req.protocol +
				'://' +
				req.get('host') +
				'/uploads/category/' +
				newCategory.image;
		}
		tmpCat.products.forEach((product) => {
			tmpPrd = {
				...product._doc,
				image_url: '',
			};
			if (
				product.image !== '' &&
				fs.existsSync(
					__dirname + '../../../uploads/product/' + product.image,
				)
			) {
				tmpCat.image_url =
					req.protocol +
					'://' +
					req.get('host') +
					'/uploads/product/' +
					product.image;
			}

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

			productMap.push(tmpPrd);
		});
		tmpCat.products = productMap;

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

export const deleteCategory = async (req, res) => {
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

export const getAll = async (req, res) => {
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
		const categories = await Category.find({})
			.sort({ name: 1 })
			.populate('products');

		// create object for returning
		let tmpPrd = {};
		let tmpCat = {};
		let productMap = [];
		let categoryMap = [];
		categories.forEach((category) => {
			productMap = [];
			tmpCat = {
				...category._doc,
				image_url: '',
			};
			if (
				category.image !== '' &&
				fs.existsSync(
					__dirname + '/../../uploads/category/' + category.image,
				)
			) {
				tmpCat.image_url =
					req.protocol +
					'://' +
					req.get('host') +
					'/uploads/category/' +
					category.image;
			}

			tmpCat.products.forEach((product) => {
				tmpPrd = {
					...product._doc,
					image_url: '',
				};
				if (
					product.image !== '' &&
					fs.existsSync(
						__dirname + '/../../uploads/product/' + product.image,
					)
				) {
					tmpPrd.image_url =
						req.protocol +
						'://' +
						req.get('host') +
						'/uploads/product/' +
						product.image;
				}

				if (
					tmpPrd.game_path !== '' &&
					fs.existsSync(
						__dirname +
							'/../../uploads/product/game/' +
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

				productMap.push(tmpPrd);
			});
			tmpCat.products = productMap;
			// categoryMap[tmpCat._id] = tmpCat;
			categoryMap.push(tmpCat);
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

export const getById = async (req, res) => {
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
		const category = await Category.findById(req.params.id).populate(
			'products',
		);

		// create object for returning
		let tmpPrd = {};
		let tmpCat = {};
		let productMap = [];
		tmpCat = {
			...category._doc,
			image_url: '',
		};
		if (
			category.image !== '' &&
			fs.existsSync(
				__dirname + '../../../uploads/category/' + category.image,
			)
		) {
			tmpCat.image_url =
				req.protocol +
				'://' +
				req.get('host') +
				'/uploads/category/' +
				category.image;
		}
		tmpCat.products.forEach((product) => {
			productMap = [];
			tmpPrd = {
				...product._doc,
				image_url: '',
			};
			if (
				product.image !== '' &&
				fs.existsSync(
					__dirname + '../../../uploads/product/' + product.image,
				)
			) {
				tmpCat.image_url =
					req.protocol +
					'://' +
					req.get('host') +
					'/uploads/product/' +
					product.image;
			}

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
			productMap.push(tmpPrd);
		});
		tmpCat.products = productMap;

		if (category) {
			return res.status(200).json({
				success: true,
				message: 'Category has been fetched successfully',
				data: { category: tmpCat },
			});
		} else {
			return res.status(500).json({
				success: false,
				message: 'Unable to fetch category',
			});
		}
	} catch (error) {
		logger.error(error);
		res.status(500).json({
			success: false,
			message: `Category Get by Id failed: ${error.message}`,
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
