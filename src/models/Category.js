const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
	name: { type: String, required: true, default: '', trim: true },
	iamge: { type: String, default: '' },
	active: { type: Boolean, default: true },
	created_at: { type: Date, default: Date.now },
	updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Category', UserSchema);
