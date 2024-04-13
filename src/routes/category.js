const express = require('express');
const router = express.Router();
const {
	addRules,
	editRules,
	deleteRules,
} = require('../validations/category.validation');
const category_image_upload = require('../helpers/category_image_upload');

// Handlers from controllers
const {
	add,
	edit,
	deleteCategory,
	getAll,
} = require('../controllers/category'); // API created using mongoose
const { auth, isAdmin } = require('../middlewares/authMiddle');

// router.get('/all', auth, isAdmin, getAll);
router.get('/all', getAll);
router.post(
	'/add',
	auth,
	isAdmin,
	category_image_upload.single('image'),
	addRules,
	add,
);
router.post(
	'/edit/:id',
	auth,
	isAdmin,
	category_image_upload.single('image'),
	editRules,
	edit,
);
router.delete('/delete/:id', auth, isAdmin, deleteRules, deleteCategory);

module.exports = router;
