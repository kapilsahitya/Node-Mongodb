const Models = require('../models');
const { body, param } = require('express-validator');
const ObjectId = require('mongodb').ObjectId;
const addRules = [
	body('name')
		.exists({ checkFalsy: true })
		.withMessage('Name is required')
		.isString()
		.withMessage('Name should be string')
		.custom(async (value) => {
			const product = await Models['Product'].findOne({ name: value });
			if (product) {
				throw new Error('A product already exists with this name');
			}
		}),
];

const editRules = [
	param('id')
		.customSanitizer((value) => new ObjectId(value))
		.custom(async (value) => {
			const product = await Models['Product'].findById(new ObjectId(value));
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

const deleteRules = [
	param('id').customSanitizer((value) => new ObjectId(value)),
];
module.exports = { addRules, editRules, deleteRules };
