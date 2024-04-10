const express = require('express');
const router = express.Router();
const {
	addRules,
	editRules,
	deleteRules,
} = require('../validations/category.validation');

// Handlers from controllers
const { add, edit, deleteCategory, getAll } = require('../controllers/category'); // API created using mongoose
const { auth, isAdmin } = require('../middlewares/authMiddle');

router.get('/all', auth, isAdmin, getAll);
router.post('/add', auth, isAdmin, addRules, add);
router.post('/edit/:id', auth, isAdmin, editRules, edit);
router.delete('/delete/:id', auth, isAdmin, deleteRules, deleteCategory);

module.exports = router;
