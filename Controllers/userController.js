const User = require('../models/userModel.js');
const AppError = require('../Utils/appError.js');
const catchAsync = require('../Utils/catchAsync.js');
const Claim = require('../models/claimModel.js');
const AssignedData = require('../models/assignedDataModel.js');

exports.assignAgentbyAdmin = catchAsync(async (req, res, next) => {
    const { claimId, agentId } = req.body;

    // Check if the user is logged in and is an admin
    if (!req.user || req.user.role !== 'ADMIN') {
        return next(new AppError('You are not authorized to perform this action', 403));
    }

    // Validate required fields
    if (!claimId || !agentId) {
        return next(new AppError('Please provide claimId and agentId', 400));
    }

    // Check if the claim exists
    const claim = await Claim.findById(claimId);
    if (!claim) {
        return next(new AppError('No claim found with that ID', 404));
    }

    // Check if the agent exists
    const agent = await User.findById(agentId);
    if (!agent || agent.role !== 'AGENT') {
        return next(new AppError('No agent found with that ID or the user is not an agent', 404));
    }

    // Assign the claim to the agent
    claim.assignedAgent = agent._id;
    await claim.save();

    // Update the agent's database to reflect the assigned claim
    if (!agent.assignedClaims) {
        agent.assignedClaims = [];
    }
    agent.assignedClaims.push(claim._id);
    await agent.save();

const assignedData = new AssignedData({
    claimId: claim._id,
    agentId: agent._id
});
await assignedData.save();

// Retrieve and display all assigned data from the database
const assignedDatas = await AssignedData.find();
res.status(200).json({
    status: 'success',
    data: {
        claim,
        agent,
        assignedDatas
    }
});
});
// Store the assigned claim and agent as a pair in the database