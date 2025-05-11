const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
    _id: {
        type: String,
        required: [true, 'Please provide Policy ID'],
        auto: false
    },
    policyNumber : {
        type: String,
        required: [true, 'Please provide Policy Number'],
        unique: true
    },
    businessId: {
        type: mongoose.Schema.ObjectId,
        ref:'user',
        required: [true, 'PA policy must be associated with a business']
    },
    coverageType: {
        type: String,
        enum: ['LIABILITY', 'PROPERTY', 'WORKERS_COMP', 'PROFESSIONAL', 'CYBER', 'UMBRELLA'],
        required: [true, 'Please provide coverage type']
    },
    coverageAmount: {
        type: Number,
        required: [true, 'Please provide coverage amount']
    },
    premiumAmount: {
        type: Number,
        required: [true, 'Please provide premium amount']
    },
    policyStartDate: {
        type: Date,
        required: [true, 'Please provide policy start date']
    },
    policyEndDate: {
        type: Date, 
        required: [true, 'Please provide policy end date']
    },
    policyStatus: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE', 'RENEWED' ,'EXPIRED', 'CANCELLED'],
        default: 'ACTIVE'
    },
    deductible: {
        type: Number,
        required: [true, 'Please provide deductible amount']
    },
    paymentFrequency: {
        type: String,
        enum: ['MONTHLY', 'QUARTERLY', 'SEMI_ANNUAL' ,'ANNUAL'],
        // default: 'ANNUALLY'
    },
    nextPaymentDate: {type: Date},
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref:'User'
    },
}, {timestamps: true}
);

// policySchema.virtual('claims', {
//     ref: 'Claim',
//     foreignField: 'policyId',
//     localField: '_id'
// });

// policySchema.pre(/^find/, function (next) {
//     this.populate({
//         path: 'bussinessId',
//         select: 'name email businessType'
//     });next(); 
// });

const Policy = mongoose.model('Policy', policySchema);
module.exports = Policy;