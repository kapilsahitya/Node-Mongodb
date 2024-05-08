// const jwt = require('jsonwebtoken');
import jwt from 'jsonwebtoken'
// require('dotenv').config();

// auth, isUser, isAdmin

export const auth = (req, res, next) => {
	try {
		// extract JWT token
		let token = req.header('Authorization');
		if (!token) {
			return res.status(401).json({
				success: false,
				message: 'Token Missing',
			});
		}

		token = token.split(' ')[1]; // Remove Bearer from string

		if (token === 'null' || !token)
			return res.status(401).send('Unauthorized request');

		// verify the token
		try {
			const decode = jwt.verify(token, process.env.JWT_SECRET);
			req.user = decode;
		} catch (error) {
			return res.status(401).json({
				success: false,
				message: 'invalid Token',
			});
		}

		next();
	} catch (error) {
		return res.status(401).json({
			success: false,
			message: 'Error Occured in Authentication.',
		});
	}
};

export const isUser = (req, res, next) => {
	try {
		if (req.user.role !== 'User') {
			return res.status(401).json({
				success: false,
				message: 'You are not authorized User!',
			});
		}

		next();
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: 'Something error occured: ' + error,
		});
	}
};

export const isAdmin = (req, res, next) => {
	try {
		if (req.user.role !== 'Admin') {
			return res.status(401).json({
				success: false,
				message: 'You are not authorized Admin!',
			});
		}

		next();
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: 'Something error occured: ' + error,
		});
	}
};

// module.exports = { auth, isUser, isAdmin };
