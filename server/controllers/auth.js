import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { createError } from '../error.js';

import User from '../models/User.js';

export const signup = async (req, res, next) => {
  try {
    const salt = bcrypt.genSaltSync(10);
    const hashed = bcrypt.hashSync(req.body.password, salt);
    const newUser = new User({ ...req.body, password: hashed });

    await newUser.save();
    res.status(200).json({ status: 'User has been created!' });
  } catch (err) {
    next(err);
  }
};

export const signin = async (req, res, next) => {
  try {
    const user = await User.findOne({ name: req.body.name });

    if (!user) {
      return next(createError(404, 'User not found'));
    } else {
      const isCorret = await bcrypt.compare(req.body.password, user.password);

      if (!isCorret) {
        return next(createError(400, 'Wrong credentials'));
      } else {
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY);
        const { password, ...others } = user._doc;

        res
          .cookie('access_token', token, { httpOnly: true })
          .status(200)
          .json(others);
      }
    }
  } catch (err) {
    next(err);
  }
};
