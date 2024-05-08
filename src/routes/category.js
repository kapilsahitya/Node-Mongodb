// const express = require('express');
import express from 'express';
const router = express.Router();
// const {
// 	addRules,
// 	editRules,
// 	deleteRules,
// } = require('../validations/category.validation');
import { addRules, editRules, deleteRules } from '../validations/category.validation.js'
// const category_image_upload = require('../helpers/category_image_upload');
import { category_image_upload } from '../helpers/category_image_upload.js';

// Handlers from controllers
// const {
// 	add,
// 	edit,
// 	deleteCategory,
// 	getAll,
// 	getById,
// } = require('../controllers/category'); // API created using mongoose
import { add, edit, deleteCategory, getAll, getById } from '../controllers/category.js';
// const { auth, isAdmin } = require('../middlewares/authMiddle');
import { auth, isAdmin } from '../middlewares/authMiddle.js';

// router.get('/all', auth, isAdmin, getAll);
router.get('/all', getAll);

// router.post(
// 	'/add',
// 	auth,
// 	isAdmin,
// 	category_image_upload.single('image'),
// 	addRules,
// 	add,
// );

router.post('/add', category_image_upload.single('image'), addRules, add);

// router.post(
// 	'/edit/:id',
// 	auth,
// 	isAdmin,
// 	category_image_upload.single('image'),
// 	editRules,
// 	edit,
// );

router.post(
	'/edit/:id',
	category_image_upload.single('image'),
	editRules,
	edit,
);

router.delete('/delete/:id', auth, isAdmin, deleteRules, deleteCategory);
router.get('/getById/:id', deleteRules, getById);

// module.exports = router;
export default router;
