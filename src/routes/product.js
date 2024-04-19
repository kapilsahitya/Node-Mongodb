const express = require('express');
const router = express.Router();
const {
	addRules,
	editRules,
	deleteRules,
	gameUploadRules,
} = require('../validations/product.validation');
const product_image_upload = require('../helpers/product_image_upload');
const game_upload = require('../helpers/game_upload');

// Handlers from controllers
const {
	add,
	edit,
	deleteProduct,
	getAll,
	gameUpload,
	getById,
} = require('../controllers/product'); // API created using mongoose
const { auth, isAdmin } = require('../middlewares/authMiddle');

// router.get('/all', auth, isAdmin, getAll);
router.get('/all', getAll);
// router.post(
// 	'/add',
// 	auth,
// 	isAdmin,
// 	product_image_upload.single('image'),
// 	addRules,
// 	add,
// );

router.post(
	'/add',
	product_image_upload.single('image'),
	addRules,
	add,
);

router.post(
	'/edit/:id',
	auth,
	isAdmin,
	product_image_upload.single('image'),
	editRules,
	edit,
);
router.delete('/delete/:id', auth, isAdmin, deleteRules, deleteProduct);
// router.get('/getById/:id', auth, isAdmin, deleteRules, getById);
router.get('/getById/:id',  deleteRules, getById);

router.post(
	'/gameUpload/:id',
	gameUploadRules,
	game_upload.single('game_file'),
	gameUpload,
);

module.exports = router;
