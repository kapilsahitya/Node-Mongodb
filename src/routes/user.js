// const AdminBro = require('admin-bro');
// const { buildRouter } = require('admin-bro-expressjs');
// const express = require('express');
import express from 'express';
const router = express.Router();
// const {
// 	singupRules,
// 	loginRules,
// 	confirmationRules,
// } = require('../validations/user.validation');
import {
	singupRules,
	loginRules,
	confirmationRules,
} from '../validations/user.validation.js';

// const buildAdminRouter = (admin) => {
// 	const router = buildRouter(admin);
// 	return router;
// };

// Handlers from controllers
// const { login, signup, confirmation } = require('../controllers/user'); // API created using mongoose
import { login, signup, confirmation } from '../controllers/user.js';
import { auth, isUser, isAdmin } from '../middlewares/authMiddle.js';
// const { auth, isUser, isAdmin } = require('../middlewares/authMiddle');

router.post('/login', loginRules, login);
router.post('/signup', singupRules, signup);
router.get('/confirmation/:email/:token', confirmationRules, confirmation);

// testing protected route
router.get('/test', auth, (req, res) => {
	res.json({
		success: true,
		message: 'You are a valid Tester.',
	});
});

// protected routes
router.get('/user', auth, isUser, (req, res) => {
	res.json({
		success: true,
		message: 'You are a valid Student.',
	});
});

router.get('/admin', auth, isAdmin, (req, res) => {
	res.json({
		success: true,
		message: 'You are a valid Admin.',
	});
});

// module.exports = router;
// module.exports = buildAdminRouter;
export default router;
