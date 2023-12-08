const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/product');

// GET route (all products)
router.get('/', async (req, res, next) => {
	try {
		const docs = await Product.find().select('name price _id').exec();
		const response = {
			count: docs.length,
			products: docs.map((doc) => {
				return {
					name: doc.name,
					price: doc.price,
					_id: doc._id,
					request: {
						type: 'GET',
						url: 'http://localhost:3000/products/' + doc._id,
					},
				};
			}),
		};
		res.status(200).json({
			message: 'Handling GET requests to /products',
			products: response,
		});
	} catch (err) {
		console.log(err);
		res.status(500).json({ error: err });
	}
});

// POST route (create product)
router.post('/', async (req, res, next) => {
	try {
		const product = new Product({
			_id: new mongoose.Types.ObjectId(),
			name: req.body.name,
			price: req.body.price,
		});
		const result = await product.save();
		res.status(201).json({
			message: 'Created product successfully',
			createdProduct: {
				name: result.name,
				price: result.price,
				_id: result._id,
				request: {
					type: 'GET',
					url: 'http://localhost:3000/products/' + result._id,
				},
			},
		});
	} catch (err) {
		console.log(err);
		res.status(500).json({ error: err });
	}
});

// GET/:productId route (get product by ID)
router.get('/:productId', async (req, res, next) => {
	try {
		const id = req.params.productId;
		const doc = await Product.findById(id).select('name price _id').exec();
		console.log('From database', doc);
		if (doc) {
			res.status(200).json({
				product: doc,
				request: {
					type: 'GET',
					description: 'Get all products',
					url: 'http://localhost:3000/products',
				},
			});
		} else {
			res.status(404).json({
				message: 'No valid entry found for provided ID',
			});
		}
	} catch (err) {
		console.log(err);
		res.status(500).json({ error: err });
	}
});

// PATCH/:productId route (update product by ID)
router.patch('/:productId', async (req, res, next) => {
	try {
		const id = req.params.productId;
		const updateOps = {};
		for (const ops of req.body) {
			// req.body is an array of objects
			updateOps[ops.propName] = ops.value;
		}
		await Product.updateOne({ _id: id }, { $set: updateOps }).exec();
		res.status(200).json({
			message: 'Product updated!',
			request: {
				type: 'GET',
				url: 'http://localhost:3000/products/' + id,
			},
		});
	} catch (err) {
		console.log(err);
		res.status(500).json({ error: err });
	}
});

// DELETE/:productId route (delete product by ID)
router.delete('/:productId', async (req, res, next) => {
	try {
		const id = req.params.productId;
		console.log('id', id)
		console.log('req.params', req.params)
		console.log('req.body', req.body)
		console.log('req.params.productId', req.params.productId)
		await Product.deleteOne({ _id: id }).exec();
		res.status(200).json({
			message: 'Product deleted!',
			request: {
				type: 'POST',
				url: 'http://localhost:3000/products',
				body: { 
					name: req.body.name, 
					price: req.body.price, 
					productId: req.params.productId },
			},
		});
	} catch (err) {
		console.log(err);
		res.status(500).json({ error: err });
	}
});

module.exports = router;