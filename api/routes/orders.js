const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/order');
const Product = require('../models/product');

// GET route (all orders)
router.get('/', async (req, res, next) => {
    console.log("hello")
    try {

        const docs = await Order
        .find()
        .select('product quantity _id')
        .populate('product', 'name price')
        .exec();

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
    } catch (err) {
        res.status(500).json({
            error: err,
        });
    }
});

// POST route (create order)
router.post('/', async (req, res, next) => {
    try {
        const productId = req.body.productId;
        const product = await Product.findById(productId);
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
        const result = await order.save();
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
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: err,
        });
    }
});
// GET/:orderId route (get order by id)
router.get('/:orderId', async (req, res, next) => {
    try {
        
        const order = await Order
        .findById(req.params.orderId)
        .populate('product', 'name price')
        .select('product quantity _id')
        .exec();
        
        if (!order) {
            return res.status(404).json({
                message: 'Order not found'
            });
        }
        res.status(200).json({
            order: order,
            request: {
                type: 'GET',
                url: 'http://localhost:3000/orders'
            }
        });
    } catch (err) {
        res.status(500).json({
            error: err
        });
    }
});

// DELETE/:orderId route (delete order by id)
router.delete('/:orderId', async (req, res, next) => {
    console.log("hello")
    try {
        const orderId = req.params.orderId;
        console.log('req.params', req.params)
        console.log('orderId', orderId)
        console.log('req.params', req.params)
        const result = await Order.findByIdAndDelete(orderId).exec();
        console.log('result', result)
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
                body: { orderId: req.params.orderId, productId: result.product, quantity: result.quantity },
            },
        });
    } catch (err) {
        res.status(500).json({
            error: err,
        });
    }
});

module.exports = router;