const express = require('express');
const claimController = require('../Controllers/claimController');
const authController = require('../Controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
// All routes defined AFTER this line will require authentication
router.use(authController.protect);

// Define specific routes first

// Route for getting claim statistics (most specific path)
router
  .route('/stats')
  .get(authController.restrictTo('ADMIN', 'AGENT'), claimController.getClaimStats); // Added restrictTo as per controller logic

// Routes with specific suffixes after the ID
// Place these before the general /:id route

// Route for uploading additional documents (CUSTOMER only when status is ADDITIONAL_INFO_REQUIRED)
// Note: This route uses the uploadAdditionalDocuments middleware *before* the actual upload logic.
// The actual file upload processing (using multer) should happen in a subsequent middleware or controller function
// attached to this route, after uploadAdditionalDocuments allows it.
router
    .route('/:id/upload-documents')
    .post(claimController.uploadAdditionalDocuments, claimController.uploadSupportingDocuments); // Chain middleware and the upload controller

// Route for adding notes to a claim
router
  .route('/:id/notes')
  .post(claimController.addClaimNote); // Authorization check is inside addClaimNote

// Route for uploading supporting documents (initial upload or general add)
// This route uses the multer middleware directly within the controller function.
// If this route is intended for initial upload, ensure createClaim doesn't expect documents in the body.
// If this is for adding documents after creation, ensure authorization is handled.
// Note: If '/:id/upload-documents' above is the preferred way for customers to add docs,
// you might restrict this route or remove it depending on your workflow.
router
  .route('/:id/documents')
  .post(claimController.uploadSupportingDocuments); // Authorization check is inside uploadSupportingDocuments

// Route for updating user claim documents (replacing the array)
// This route expects a JSON body with the supportingDocuments array.
router
  .route('/:id/documents')
  .put(claimController.updateUserClaimDocuments); // Authorization check is inside updateUserClaimDocuments

// Route for getting claim status
router
  .route('/:id/checkStatus')
  .get(claimController.getClaimStatus); // Authorization check is inside getClaimStatus

// Route for updating claim status (AGENT, ADMIN, CUSTOMER)
// Apply the restrictTo middleware here as the controller checks for these roles.
// Note: Your controller allows CUSTOMERs to update status *only* for document upload when status is ADDITIONAL_INFO_REQUIRED.
// The restrictTo middleware here allows all three roles to hit the endpoint, but the controller's internal logic
// will further restrict what they can *do* based on the current claim status and role.
router
  .route('/:id/status')
  .patch(authController.restrictTo('AGENT', 'ADMIN', 'CUSTOMER'), claimController.updateClaimStatus);


// Define the base route
router
  .route('/')
  .get(claimController.getAllClaims) // Authorization check is inside getAllClaims
  .post(claimController.createClaim); // Authorization check is inside createClaim


// Define the general /:id route (should come after more specific /:id/* routes)
router
  .route('/:id')
  .get(claimController.getClaim); // Authorization check is inside getClaim


// Routes accessible only to admins
// Apply the restrictTo middleware specifically for admin-only routes that follow
router.use(authController.restrictTo('ADMIN'));

// This delete route will only be accessible to ADMINs due to the middleware above
router
  .route('/:id')
  .delete(claimController.deleteClaim); // Authorization check is inside deleteClaim

module.exports = router;
