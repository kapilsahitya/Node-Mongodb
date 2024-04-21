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
	getById,
} = require('../controllers/category'); // API created using mongoose
const { auth, isAdmin } = require('../middlewares/authMiddle');

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

router.post(
	'/add',
	category_image_upload.single('image'),
	addRules,
	add,
);

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

module.exports = router;
