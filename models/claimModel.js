const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
    policyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Policy',
        required: true
    },
    claimAmount: {
        type: Number,
        required: true
    },
    claimDate: {
        type: Date,
        default: Date.now()
    },
    incidentDate: {
        type: Date,
        required: [true, 'Please provide Incident Date']
    },
    description: {
        type: String,
        required: [true, 'Please provide Description']
    },
    claimStatus: {
        type: String,
        enum: ['OPEN', 'APPROVED', 'REJECTED', 'PENDING_REVIEW','ADDITIONAL_INFO_REQUIRED'],
        default: 'OPEN'
    },
    supportingDocuments: {
        type: [String]   // Array of URLs or file paths 
    },
    assignedAgent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    notes:[{
        content :String,
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        createdAt: {
            type: Date,
            default: Date.now()
        }
    }],
    resolutionDate: {
        type: Date
    },
    approvedAmount: {
        type: Number
    },
    rejectionReason: {
        type: String
    }

}, { timestamps: true });

claimSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'policyId',
        select: 'policyNumber coverageAmount policyStatus businessId'
    }).populate({
        path: 'assignedAgent',
        select: 'name email'
    });next();
});

const Claim = mongoose.model('Claim', claimSchema);
module.exports = Claim;