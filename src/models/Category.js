const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
	name: { type: String, required: true, default: '', trim: true },
	description: { type: String, default: '' },
	image: { type: String, default: '' },
	active: { type: Boolean, default: true },
	created_at: { type: Date, default: Date.now },
	updated_at: { type: Date, default: Date.now },
	products: [{ type: mongoose.Types.ObjectId, ref: 'Product' }],
});

module.exports = mongoose.model('Category', CategorySchema);
