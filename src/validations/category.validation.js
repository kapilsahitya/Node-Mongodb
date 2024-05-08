// const Models = require('../models');
import { Category } from '../models/Category.js';
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
			const category = await Category.findOne({ name: value });
			if (category) {
				throw new Error('A category already exists with this name');
			}
		}),
];

export const editRules = [
	param('id')
		.customSanitizer((value) => new ObjectId(value))
		.custom(async (value) => {
			const category = await Category.findById(new ObjectId(value));
			if (!category) {
				throw new Error('Invalid category id');
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
			const category = await Category.findById(new ObjectId(value));
			if (!category) {
				throw new Error('Invalid category id');
			}
		}),
];
// module.exports = { addRules, editRules, deleteRules };
