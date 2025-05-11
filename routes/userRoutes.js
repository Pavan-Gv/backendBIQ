//  GET /api/v1/claims/agent/:agentId/count
const express = require('express');
const claimController = require('../Controllers/claimController');
const authController = require('../Controllers/authController');
const userController = require('../Controllers/userController');
const router = express.Router();
router.use(authController.protect);

router
    .route('/:agentId/count')
    .get(claimController.getclaimCountofAgent);
router
    .route('/assignAgent')
    .patch(authController.protect, authController.restrictTo('ADMIN'), userController.assignAgentbyAdmin);

module.exports = router;
