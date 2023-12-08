const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/order');
const Product = require('../models/product');

router.get('/', (req, res, next) => {
	Order.find()
		.select('product quantity _id')
		// .populate('product', 'name')
		.exec()
		.then((docs) => {
			res.status(200).json({
				count: docs.length,
				orders: docs.map((doc) => {
					return {
						_id: doc._id,
						product: doc.product,
						quantity: doc.quantity,
						request: {
							type: 'GET',
							url: 'http://localhost:3000/orders/' + doc._id,
						},
					};
				}),
			});
		})
		.catch((err) => {
			res.status(500).json({
				error: err,
			});
		});
});

router.post('/', (req, res, next) => {
	const productId = req.body.productId;
	Product.findById(productId)
		.then((product) => {
			if (!product) {
				return res.status(404).json({
					message: 'Product not found',
				});
			}
			const order = new Order({
				_id: new mongoose.Types.ObjectId(),
				product: productId,
				quantity: req.body.quantity,
			});
			return order.save();
		})
		.then((result) => {
			console.log(result);
			res.status(201).json({
				message: 'Order stored',
				createdOrder: {
					_id: result._id,
					product: result.product,
					quantity: result.quantity,
				},
				request: {
					type: 'GET',
					url: 'http://localhost:3000/orders/' + result._id,
				},
			});
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({
				error: err,
			});
		});
});

router.get('/:orderId', (req, res, next) => {
	const orderId = req.params.orderId;
	Order.findById(orderId)
		.select('product quantity _id')
		.exec()
		.then((order) => {
			if (!order) {
				return res.status(404).json({
					message: 'Order not found',
				});
			}
			res.status(200).json({
				order: {
					_id: order._id,
					product: order.product,
					quantity: order.quantity,
				},
				request: {
					type: 'GET',
					url: 'http://localhost:3000/orders',
				},
			});
		})
		.catch((err) => {
			res.status(500).json({
				error: err,
			});
		});
});

router.delete('/:orderId', (req, res, next) => {
    const orderId = req.params.orderId;
	Order.findByIdAndDelete(orderId)
		.exec()
        .then((result) => {
            if (!result) {
                return res.status(404).json({
                    message: 'Order not found',
                });
            }
            res.status(200).json({
                message: 'Order deleted',
                request: {
                    type: 'POST',
                    url: 'http://localhost:3000/orders',
                    body: { productId: req.body.productId, quantity: req.body.quantity },
                },
            });
        })
		.catch((err) => {
			res.status(500).json({
				error: err,
			});
		});
});

module.exports = router;