// const Models = require('../models');
import { Product } from '../models/Product.js';
// const { body, param } = require('express-validator');
import { body, param } from 'express-validator';
import mongodb from 'mongodb';
const ObjectId = mongodb.ObjectId;

export const addRules = [
	body('name')
		.exists({ checkFalsy: true })
		.withMessage('Name is required')
		.isString()
		.withMessage('Name should be string')
		.custom(async (value) => {
			const product = await Product.findOne({ name: value });
			if (product) {
				throw new Error('A product already exists with this name');
			}
		}),
];

export const editRules = [
	param('id')
		.customSanitizer((value) => new ObjectId(value))
		.custom(async (value) => {
			const product = await Product.findById(new ObjectId(value));
			if (!product) {
				throw new Error('Invalid product id');
			}
		}),
	body('name')
		.exists({ checkFalsy: true })
		.withMessage('Name is required')
		.isString()
		.withMessage('Name should be string'),
];

export const deleteRules = [
	param('id')
		.customSanitizer((value) => new ObjectId(value))
		.custom(async (value) => {
			const product = await Product.findById(new ObjectId(value));
			if (!product) {
				throw new Error('Invalid product id');
			}
		}),
];

export const gameUploadRules = [
	param('id')
		.customSanitizer((value) => new ObjectId(value))
		.custom(async (value) => {
			const product = await Product.findById(new ObjectId(value));
			if (!product) {
				throw new Error('Invalid product id');
			}
		}),
];

// module.exports = { addRules, editRules, deleteRules, gameUploadRules };
