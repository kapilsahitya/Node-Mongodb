const multer = require('multer');
const path = require('node:path');

const storageConfig = multer.diskStorage({
	// destinations is uploads folder
	// under the project directory
	destination: path.join(__dirname, '/../../uploads/category/'),
	filename: (req, file, res) => {
		// file name is prepended with current time
		// in milliseconds to handle duplicate file names
		res(null, Date.now() + '-' + file.originalname);
	},
});

// file filter for filtering only images
const fileFilterConfig = function (req, file, cb) {
	const mimetypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/vnd'];
	if (mimetypes.includes(file.mimetype)) {
		// calling callback with true
		// as mimetype of file is image
		cb(null, true);
	} else {
		// false to indicate not to store the file
		cb(null, false);
	}
};

// creating multer object for storing
// with configuration
const category_image_upload = multer({
	// applying storage and file filter
	storage: storageConfig,
	limits: {
		// limits file size to 5 MB
		fileSize: 1024 * 1024 * 5,
	},
	fileFilter: fileFilterConfig,
});

module.exports = category_image_upload;
