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
			const category = await Models['Category'].findOne({ name: value });
			if (category) {
				throw new Error('A category already exists with this name');
			}
		}),
];

const editRules = [
	param('id').customSanitizer((value) => new ObjectId(value)),
	body('name')
		.exists({ checkFalsy: true })
		.withMessage('Name is required')
		.isString()
		.withMessage('Name should be string'),
];

const deleteRules = [param('id').customSanitizer((value) => new ObjectId(value))];
module.exports = { addRules, editRules, deleteRules };
