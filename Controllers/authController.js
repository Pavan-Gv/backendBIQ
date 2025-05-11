const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('../Utils/appError');
const catchAsync = require('../Utils/catchAsync');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  
  res.cookie('jwt', token, cookieOptions);
  
  // Remove password from output
  user.password = undefined;
  
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

// Register new user
exports.signup = catchAsync(async (req, res, next) => {
    const { email, password, passwordConfirm, name, firstName, lastName, businessType, address, phone, role } = req.body;

    // Validate required fields
    if (!email || !password || !passwordConfirm || !firstName || !lastName) {
        return res.status(400).json({ message: 'Please provide email, password, password confirmation, first name, and last name' });
    }

    // Check if passwords match
    if (password !== passwordConfirm) {
        return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Check if user with the same email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
    }

    // By default, register users as CUSTOMERS
    // ADMIN and AGENT roles need to be assigned manually
    const userRole = role === 'CUSTOMER' ? 'CUSTOMER' : 'CUSTOMER';

    const newUser = await User.create({
        name: name || `${firstName} ${lastName}`,
        email,
        password,
        passwordConfirm,
        role: userRole,
        businessType,
        address,
        phone
    });

    createSendToken(newUser, 201, res);
});

// Login user
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  
  // Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  
  // Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');
  
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  
  // If everything ok, send token to client
  createSendToken(user, 200, res);
});

// Protect routes - require authentication
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Get token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }
  
  // 2) Verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET_KEY);
  
  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token no longer exists.', 401)
    );
  }
  
  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }
  
  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

// Restrict to certain roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    
    next();
  };
};