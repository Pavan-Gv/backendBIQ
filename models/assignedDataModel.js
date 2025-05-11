const mongoose = require('mongoose');

const assignedDataSchema = new mongoose.Schema({
    claimId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Claim',
        required: true
    },
    agentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedAt: {
        type: Date,
        default: Date.now
    }
});

const AssignedData = mongoose.model('AssignedData', assignedDataSchema);

module.exports = AssignedData;

