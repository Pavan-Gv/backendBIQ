const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const policyRoutes = require('./routes/policyRoutes');
const claimRoutes = require('./routes/claimRoutes');

dotenv.config({path: './config.env'});

const app = express();

app.use(express.json(), express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);  
// app.use('/api/policies', policyRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/users', userRoutes);

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const status = err.status || 'error';

    res.status(statusCode).json({
        status,
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : {}
    });
});

module.exports = app;