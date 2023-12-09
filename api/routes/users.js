const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt = require("jsonwebtoken");

// User Signup Route
router.post("/signup", async (req, res, next) => {
    try {
        const user = await User.find({ email: req.body.email }).exec();
        if (user.length >= 1) {
            return res.status(409).json({
                message: "Mail exists"
            });
        } else {
            const hash = await bcrypt.hash(req.body.password, 10);
            const newUser = new User({
                _id: new mongoose.Types.ObjectId(),
                email: req.body.email,
                password: hash
            });
            const result = await newUser.save();
            console.log(result);
            res.status(201).json({
                message: "User created"
            });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: err
        });
    }
});
  

// User Delete Route
router.delete("/:userId", (req, res, next) => {
    User.remove({ _id: req.params.userId })
      .exec()
      .then(result => {
        res.status(200).json({
          message: "User deleted"
        });
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          error: err
        });
      });
  });

module.exports = router;
