// const mongoose = require('mongoose');
import mongoose from 'mongoose'

const ProductSchema = new mongoose.Schema({
	name: { type: String, required: true, default: '', trim: true },
	description: { type: String, default: '' },
	image: { type: String, default: '' },
	game_path: { type: String, default: '' },
	active: { type: Boolean, default: true },
	created_at: { type: Date, default: Date.now },
	updated_at: { type: Date, default: Date.now },
	categories: [{ type: mongoose.Types.ObjectId, ref: 'Category' }],
});

// module.exports = mongoose.model('Product', ProductSchema);
export const Product = mongoose.model('Product', ProductSchema);
