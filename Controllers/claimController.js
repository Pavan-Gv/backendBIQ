// const Claim = require('../models/claimModel');
// const Policy = require('../models/policyModel');
// const AppError = require('../Utils/appError');
// const catchAsync = require('../Utils/catchAsync');
// const multer = require('multer');
// const path = require('path');

// exports.createClaim = catchAsync(async (req, res, next) => {
//   const policy = await Policy.findById(req.body.policyId);

//   if (!policy) {
//     return next(new AppError('No policy found with that ID', 404));
//   }

//   if (policy.policyStatus !== 'ACTIVE') {
//     return next(new AppError('Claims can only be submitted for active policies', 400));
//   }

//   // Check if the logged-in user is linked to the policy through their own ID
//   if (
//     req.user.role === 'CUSTOMER' &&
//     (policy.businessId.toString() !== req.user._id.toString())
//   ) {
//     return next(new AppError('You can only submit claims for your own policies', 403));
//   }
//   // Ensure supportingDocuments is an array
//   const supportingDocuments = Array.isArray(req.body.supportingDocuments)
//     ? req.body.supportingDocuments
//     : [];

//   const newClaim = await Claim.create({
//     policyId: req.body.policyId,
//     claimAmount: req.body.claimAmount,
//     incidentDate: req.body.incidentDate,
//     description: req.body.description,
//     supportingDocuments: req.body.supportingDocuments||[],
//     claimStatus: 'OPEN'
//   });

//   res.status(201).json({
//     status: 'success',
//     data: {
//       claim: newClaim
//     }
//   });
// });

// exports.getAllClaims = catchAsync(async (req, res, next) => {
//   let filter = {};
  
//   if (req.user.role === 'CUSTOMER') {
//     const policies = await Policy.find({ businessId: req.user._id });
//     const policyIds = policies.map(policy => policy._id);
//     filter = { policyId: { $in: policyIds } };
//   }
  
//   if (req.query.status) {
//     filter.claimStatus = req.query.status.toUpperCase();
//   }
  
//   const claims = await Claim.find(filter);
  
//   res.status(200).json({
//     status: 'success',
//     results: claims.length,
//     data: {
//       claims
//     }
//   });
// });

// exports.getClaim = catchAsync(async (req, res, next) => {
//   const claim = await Claim.findById(req.params.id);
  
//   if (!claim) {
//     return next(new AppError('No claim found with that ID', 404));
//   }
  
//   // Check authorization - only owners, admins, or assigned agents can view
//   if (
//     req.user.role === 'CUSTOMER'  && 
//     claim.policyId.businessId._id.toString() !== req.user._id.toString()
//   ) {
//     return next(new AppError('You do not have permission to view this claim', 403));
//   }
  
//   res.status(200).json({
//     status: 'success',
//     data: {
//       claim
//     }
//   });
// });
// exports.updateClaimStatus = catchAsync(async (req, res, next) => {
//   if (!['ADMIN', 'AGENT', 'CUSTOMER'].includes(req.user.role)) {
//     return next(new AppError('You do not have permission to perform this action', 403));
//   }

//   const { claimStatus, notes, approvedAmount, rejectionReason } = req.body;

//   // Validate claimStatus
//   if (!['OPEN', 'APPROVED', 'REJECTED', 'PENDING_REVIEW', 'ADDITIONAL_INFO_REQUIRED'].includes(claimStatus)) {
//     return next(new AppError('Invalid claim status', 400));
//   }

//   const claim = await Claim.findById(req.params.id);

//   if (!claim) {
//     return next(new AppError('No claim found with that ID', 404));
//   }
//   // Update claim
//   claim.claimStatus = claimStatus;
//   claim.approvedAmount = approvedAmount;

//   // Add additional fields based on claimStatus
//   if (claimStatus === 'APPROVED') {
//     claim.approvedAmount = approvedAmount || claim.claimAmount;
//     claim.resolutionDate = Date.now();
//   } else if (claimStatus === 'REJECTED') {
//     claim.rejectionReason = rejectionReason;
//     claim.resolutionDate = Date.now();
//   }

//   // Add notes if provided
//   if (notes) {
//     claim.notes.push({
//       content: notes,
//       createdBy: req.user._id
//     });
//   }

//   // Assign to agent if not already assigned
//   if (!claim.assignedAgent) {
//     claim.assignedAgent = req.user._id;
//   }

//   await claim.save();

//   res.status(200).json({
//     status: 'success',
//     data: {
//       claim
//     }
//   });
// });
// // Middleware to allow uploading additional documents only if status is ADDITIONAL_INFO_REQUIRED
// exports.uploadAdditionalDocuments = catchAsync(async (req, res, next) => {
//   const claim = await Claim.findById(req.params.id);

//   if (!claim) {
//     return next(new AppError('No claim found with that ID', 404));
//   }

//   // Check if the claim status is ADDITIONAL_INFO_REQUIRED
//   if (claim.claimStatus !== 'ADDITIONAL_INFO_REQUIRED') {
//     return next(new AppError('You can only upload documents when additional information is required', 400));
//   }

//   // Allow only customers to upload additional documents
//   if (req.user.role !== 'CUSTOMER') {
//     return next(new AppError('Only customers can upload additional documents', 403));
//   }

//   // Proceed to upload documents
//   next();
// });
// // Route for CUSTOMER to upload supporting documents when status is ADDITIONAL_INFO_REQUIRED
// // POST /api/v1/claims/:id/upload-documents


// // Add notes to a claim
// exports.addClaimNote = catchAsync(async (req, res, next) => {
//   const claim = await Claim.findById(req.params.id);
  
//   if (!claim) {
//     return next(new AppError('No claim found with that ID', 404));
//   }
  
//   // Check authorization
//   if (
//     req.user.role === 'CUSTOMER' &&
//     claim.policyId.businessId._id.toString() !== req.user._id.toString()
//   ) {
//     return next(new AppError('You do not have permission to add notes to this claim', 403));
//   }
  
//   // Add the note
//   claim.notes.push({
//     content: req.body.content,
//     createdBy: req.user._id
//   });
  
//   await claim.save();
  
//   res.status(200).json({
//     status: 'success',
//     data: {
//       claim
//     }
//   });
// });

// // Upload supporting documents
// // Configure multer for file uploads
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'C:/Users/2388187/OneDrive - Cognizant/Desktop/BIQ-PMS-Backend/plan-B/uploads'); // Specify the directory to save uploaded files
//     },
//     filename: (req, file, cb) => {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
//     }
// });

// const upload = multer({
//     storage,
//     fileFilter: (req, file, cb) => {
//         const fileTypes = /jpeg|jpg|png|pdf/; // Allowed file types
//         const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
//         const mimetype = fileTypes.test(file.mimetype);

//         if (extname && mimetype) {
//             cb(null, true);
//         } else {
//             cb(new AppError('Only images and PDFs are allowed', 400));
//         }
//     }
// }).array('documents', 5); // Allow up to 5 files

// exports.uploadSupportingDocuments = (req, res, next) => {
//     upload(req, res, async (err) => {
//         if (err) {
//             return next(new AppError(err.message, 400));
//         }

//         const claim = await Claim.findById(req.params.id);

//         if (!claim) {
//             return next(new AppError('No claim found with that ID', 404));
//         }

//         // Check authorization
//         if (
//             req.user.role === 'CUSTOMER' &&
//             claim.policyId.businessId._id.toString() !== req.user._id.toString()
//         ) {
//             return next(new AppError('You do not have permission to add documents to this claim', 403));
//         }

//         // Ensure supportingDocuments is initialized
//         const filePaths = req.files.map(file => file.path);
//         claim.supportingDocuments = claim.supportingDocuments
//             ? [...claim.supportingDocuments, ...filePaths]
//             : filePaths;

//         await claim.save();

//         res.status(200).json({
//             status: 'success',
//             data: {
//                 claim
//             }
//         });
//     });
// };
// exports.updateUserClaimDocuments = catchAsync(async (req, res, next) => {
//   const claim = await Claim.findById(req.params.id);

//   if (!claim) {
//     return next(new AppError('No claim found with that ID', 404));
//   }

//   // Check authorization
//   if (
//     req.user.role === 'CUSTOMER' &&
//     claim.policyId.businessId._id.toString() !== req.user._id.toString()
//   ) {
//     return next(new AppError('You do not have permission to update documents for this claim', 403));
//   }

//   // Validate and update supporting documents
//   if (!claim) {
//     return next(new AppError('Invalid or missing supporting documents', 400));
//   }

//   await claim.save();

//   res.status(200).json({
//     status: 'success',
//     data: {
//       claim
//     }
//   });
// });

// // Delete a claim (admin only)
// exports.deleteClaim = catchAsync(async (req, res, next) => {
//   if (req.user.role !== 'ADMIN') {
//     return next(new AppError('You do not have permission to perform this action', 403));
//   }
  
//   const claim = await Claim.findByIdAndDelete(req.params.id);
  
//   if (!claim) {
//     return next(new AppError('No claim found with that ID', 404));
//   }
  
//   res.status(204).json({
//     status: 'success',
//     data: null
//   });
// });

// // Get claim statistics (for admins and agents)
// exports.getClaimStats = catchAsync(async (req, res, next) => {
//   if (!['ADMIN', 'AGENT'].includes(req.user.role)) {
//     return next(new AppError('You do not have permission to access this data', 403));
//   }
  
//   const stats = await Claim.aggregate([
//     {
//       $group: {
//         _id: '$claimStatus',
//         count: { $sum: 1 },
//         totalAmount: { $sum: '$claimAmount' },
//         avgAmount: { $avg: '$claimAmount' }
//       }
//     },
//     {
//       $sort: { count: -1 }
//     }
//   ]);
  
//   res.status(200).json({
//     status: 'success',
//     data: {
//       stats
//     }
//   });
// });
// exports.getClaimStatus = catchAsync(async (req, res, next) => {
//   const claim = await Claim.findById(req.params.id);

//   if (!claim) {
//     return next(new AppError('No claim found with that ID', 404));
//   }

//   const policy = await Policy.findById(claim.policyId);

//   if (!policy) {
//     return next(new AppError('No policy found associated with this claim', 404));
//   }

//   // Check if the policy's businessId matches the logged-in user's ID
//   if (
//     req.user.role === 'CUSTOMER' &&
//     (policy.businessId.toString() !== req.user._id.toString())
//   ) {
//     return next(new AppError('You do not have permission to view this claim status', 403));
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       status: claim.claimStatus
//     }
//   });
// });
// exports.getclaimCountofAgent = catchAsync(async (req, res, next) => {
//   const agentId = req.params.agentId;
//   const claimCount = await Claim.countDocuments({ assignedAgent: agentId });

//   if (claimCount === null) {
//     return next(new AppError('No claims found for this agent', 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       claimCount
//     }
//   });
// });
// // Route to get the count of claims assigned to a specific agent
// // GET /api/v1/claims/agent/:agentId/count

const Claim = require('../models/claimModel');
const Policy = require('../models/policyModel');
const AppError = require('../Utils/appError');
const catchAsync = require('../Utils/catchAsync');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const User = require('../models/userModel'); // Import User model for potential population or checks

exports.createClaim = catchAsync(async (req, res, next) => {
  // Fetch the policy to validate existence, status, and ownership
  const policy = await Policy.findById(req.body.policyId);

  if (!policy) {
    return next(new AppError('No policy found with that ID', 404));
  }

  if (policy.policyStatus !== 'ACTIVE') {
    return next(new AppError('Claims can only be submitted for active policies', 400));
  }

  // Check if the logged-in user is linked to the policy through their own ID
  // This check is primarily for the CUSTOMER role
  if (
    req.user.role === 'CUSTOMER' &&
    (policy.businessId.toString() !== req.user._id.toString())
  ) {
    return next(new AppError('You can only submit claims for your own policies', 403));
  }

  // Create the new claim
  const newClaim = await Claim.create({
    policyId: req.body.policyId,
    claimAmount: req.body.claimAmount,
    incidentDate: req.body.incidentDate,
    description: req.body.description,
    // Assuming supportingDocuments might be file paths from an initial upload
    // or an empty array if no documents are uploaded during creation.
    // The multer middleware for initial creation would handle populating req.body.supportingDocuments
    // with file paths if files are uploaded. If not, it defaults to [].
    supportingDocuments: Array.isArray(req.body.supportingDocuments) ? req.body.supportingDocuments : [],
    claimStatus: 'OPEN',
    // No assignedAgent at creation; it's assigned by Admin later
  });

  // Optionally populate policyId and assignedAgent to return a richer object
  const populatedClaim = await Claim.findById(newClaim._id)
    .populate('policyId')
    .populate('assignedAgent');


  res.status(201).json({
    status: 'success',
    data: {
      claim: populatedClaim // Return populated claim
    }
  });
});

exports.getAllClaims = catchAsync(async (req, res, next) => {
  let filter = {};

  if (req.user.role === 'CUSTOMER') {
    // Find policies owned by the customer and filter claims by those policies
    const policies = await Policy.find({ businessId: req.user._id });
    const policyIds = policies.map(policy => policy._id);
    filter = { policyId: { $in: policyIds } };
  } else if (req.user.role === 'AGENT') {
    // Agents only see claims assigned to them
    filter = { assignedAgent: req.user._id };
  }
  // Admins see all claims (filter remains {})

  // Add status filter if provided
  if (req.query.status) {
    filter.claimStatus = req.query.status.toUpperCase();
  }

  const claims = await Claim.find(filter)
    .populate('policyId') // Populate policy for potential display/checks
    .populate('assignedAgent'); // Populate assigned agent

  res.status(200).json({
    status: 'success',
    results: claims.length,
    data: {
      claims
    }
  });
});

exports.getClaim = catchAsync(async (req, res, next) => {
  // Populate policyId and assignedAgent for easier access and authorization checks
  const claim = await Claim.findById(req.params.id)
    .populate('policyId') // Populate policy
    .populate('assignedAgent'); // Populate assigned agent

  if (!claim) {
    return next(new AppError('No claim found with that ID', 404));
  }

  // Check authorization: Admin, Customer owner, or Assigned Agent
  const isCustomerOwner = claim.policyId && claim.policyId.businessId && claim.policyId.businessId.toString() === req.user._id.toString();
  const isAssignedAgent = claim.assignedAgent && claim.assignedAgent._id.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'ADMIN';

  if (!isAdmin && !isCustomerOwner && !isAssignedAgent) {
    return next(new AppError('You do not have permission to view this claim', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      claim
    }
  });
});

exports.updateClaimStatus = catchAsync(async (req, res, next) => {
  // Only ADMINs and assigned AGENTs can change claim status in this route
  // Customers might interact via other routes (add notes, upload docs)
  if (!['ADMIN', 'AGENT'].includes(req.user.role)) {
    return next(new AppError('You do not have permission to perform this action', 403));
  }

  const { claimStatus, notes, approvedAmount, rejectionReason } = req.body;

  // Validate claimStatus
  const validStatuses = ['OPEN', 'APPROVED', 'REJECTED', 'PENDING_REVIEW', 'ADDITIONAL_INFO_REQUIRED', 'CLOSED']; // Added 'CLOSED' if applicable
  if (!validStatuses.includes(claimStatus)) {
    return next(new AppError(`Invalid claim status. Must be one of: ${validStatuses.join(', ')}`, 400));
  }

  const claim = await Claim.findById(req.params.id).populate('assignedAgent'); // Populate assignedAgent for check

  if (!claim) {
    return next(new AppError('No claim found with that ID', 404));
  }

  // If the user is an AGENT, they must be the assigned agent for this claim
  if (req.user.role === 'AGENT' && (!claim.assignedAgent || claim.assignedAgent._id.toString() !== req.user._id.toString())) {
     return next(new AppError('You can only update the status of claims assigned to you', 403));
  }

  // Update claim fields based on valid statuses
  claim.claimStatus = claimStatus;

  // Reset specific fields if status changes
  if (claimStatus !== 'APPROVED') {
      claim.approvedAmount = undefined; // Or null, depending on schema type
  }
  if (claimStatus !== 'REJECTED') {
      claim.rejectionReason = undefined; // Or null
  }

  // Set fields based on specific statuses
  if (claimStatus === 'APPROVED') {
    // Default approvedAmount to claimAmount if not provided, or use provided
    claim.approvedAmount = approvedAmount !== undefined ? approvedAmount : claim.claimAmount;
    claim.resolutionDate = Date.now();
  } else if (claimStatus === 'REJECTED') {
    if (!rejectionReason) {
         return next(new AppError('Rejection reason is required for rejected claims', 400));
    }
    claim.rejectionReason = rejectionReason;
    claim.resolutionDate = Date.now();
  } else if (claimStatus === 'CLOSED') {
     // Assuming CLOSED is a final state, could also set resolutionDate
     claim.resolutionDate = Date.now(); // Optional: set resolution date when closed
  } else {
      // For other non-final statuses, clear resolution date
      claim.resolutionDate = undefined; // Or null
  }


  // Add notes if provided. Allow ADMIN, AGENT, and potentially CUSTOMER (via a separate route or check) to add notes.
  // The current check above restricts *status* change, but notes could be separate.
  // Let's assume ADMIN/AGENT can add notes via this route, and Customer via addClaimNote.
  if (notes) {
     // Ensure notes is an array of objects if it's not already initialized or is null/undefined
    if (!Array.isArray(claim.notes)) {
        claim.notes = [];
    }
    claim.notes.push({
      content: notes,
      createdBy: req.user._id,
      createdAt: new Date() // Add timestamp for notes
    });
  }

  // **IMPORTANT:** Remove this line. Agent assignment is handled by admin now.
  // if (!claim.assignedAgent) {
  //     claim.assignedAgent = req.user._id; // This logic conflicts with admin assignment
  // }

  await claim.save();

  // Re-populate to return consistent object structure
  const updatedClaim = await Claim.findById(claim._id)
     .populate('policyId')
     .populate('assignedAgent');


  res.status(200).json({
    status: 'success',
    data: {
      claim: updatedClaim
    }
  });
});

// Middleware to allow uploading additional documents only if status is ADDITIONAL_INFO_REQUIRED
// and user is CUSTOMER. This middleware seems specific to a customer providing *requested* docs.
exports.uploadAdditionalDocuments = catchAsync(async (req, res, next) => {
  const claim = await Claim.findById(req.params.id);

  if (!claim) {
    return next(new AppError('No claim found with that ID', 404));
  }

  // Check if the claim status is ADDITIONAL_INFO_REQUIRED
  if (claim.claimStatus !== 'ADDITIONAL_INFO_REQUIRED') {
    return next(new AppError('You can only upload additional documents when additional information is required', 400));
  }

  // Allow only customers to upload *additional* documents via this specific flow
  if (req.user.role !== 'CUSTOMER') {
    return next(new AppError('Only customers can upload additional documents', 403));
  }

  // Check if the logged-in customer owns the policy associated with the claim
  const policy = await Policy.findById(claim.policyId);
   if (!policy || policy.businessId.toString() !== req.user._id.toString()) {
       return next(new AppError('You do not have permission to upload documents for this claim', 403));
   }


  // Proceed to upload documents (the actual upload handling is in uploadSupportingDocuments)
  next();
});
// Route for CUSTOMER to upload supporting documents when status is ADDITIONAL_INFO_REQUIRED
// POST /api/v1/claims/:id/upload-documents


// Add notes to a claim
exports.addClaimNote = catchAsync(async (req, res, next) => {
  const claim = await Claim.findById(req.params.id)
     .populate('policyId') // Populate policy to check ownership
     .populate('assignedAgent'); // Populate assigned agent to check assignment

  if (!claim) {
    return next(new AppError('No claim found with that ID', 404));
  }

  // Check authorization: Admin, Customer owner, or Assigned Agent can add notes
  const isCustomerOwner = claim.policyId && claim.policyId.businessId && claim.policyId.businessId.toString() === req.user._id.toString();
  const isAssignedAgent = claim.assignedAgent && claim.assignedAgent._id.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'ADMIN';

  if (!isAdmin && !isCustomerOwner && !isAssignedAgent) {
    return next(new AppError('You do not have permission to add notes to this claim', 403));
  }

  // Add the note
   if (!req.body.content || req.body.content.trim() === '') {
        return next(new AppError('Note content cannot be empty', 400));
   }

   if (!Array.isArray(claim.notes)) {
        claim.notes = []; // Initialize if null or undefined
   }

  claim.notes.push({
    content: req.body.content.trim(),
    createdBy: req.user._id,
    createdAt: new Date() // Add timestamp for notes
  });

  await claim.save();

   // Re-populate to return consistent object structure
  const updatedClaim = await Claim.findById(claim._id)
     .populate('policyId')
     .populate('assignedAgent');

  res.status(200).json({
    status: 'success',
    data: {
      claim: updatedClaim
    }
  });
});

// Upload supporting documents
// Configure multer for file uploads (Keep as is, but note usage below)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      // Use a more flexible path or environment variable instead of a hardcoded local path
      // Example: path.join(__dirname, '..', 'uploads', 'claims', req.params.id)
      // Ensure this directory exists or is created.
        cb(null, 'C:/Users/2388187/OneDrive - Cognizant/Desktop/BIQ-PMS-Backend/plan-B/uploads'); // <--- !!! DANGEROUS HARDCODED PATH !!! Change this.
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png|pdf/; // Allowed file types
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = fileTypes.test(file.mimetype);

        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new AppError('Only images and PDFs are allowed', 400));
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 } // Limit file size (e.g., 5MB)
}).array('documents', 5); // Allow up to 5 files with the field name 'documents'

// This handler can be used for initial document upload during creation,
// or for additional document uploads by authorized users (potentially after the middleware check).
exports.uploadSupportingDocuments = (req, res, next) => {
    upload(req, res, async (err) => {
        if (err) {
            return next(new AppError(err.message, 400));
        }

        // Check if files were actually uploaded
        if (!req.files || req.files.length === 0) {
            return next(new AppError('No files uploaded', 400));
        }

        const claim = await Claim.findById(req.params.id)
           .populate('policyId') // Populate policy to check ownership
           .populate('assignedAgent'); // Populate assigned agent

        if (!claim) {
            return next(new AppError('No claim found with that ID', 404));
        }

        // Check authorization: Admin, Customer owner, or Assigned Agent can add documents
        // Note: The middleware `uploadAdditionalDocuments` provides a *more specific* check
        // for a particular flow (Customer + ADDITIONAL_INFO_REQUIRED status).
        // This handler allows uploads if authorized by role/assignment/ownership.
        const isCustomerOwner = claim.policyId && claim.policyId.businessId && claim.policyId.businessId.toString() === req.user._id.toString();
        const isAssignedAgent = claim.assignedAgent && claim.assignedAgent._id.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'ADMIN';

         if (!isAdmin && !isCustomerOwner && !isAssignedAgent) {
            return next(new AppError('You do not have permission to add documents to this claim', 403));
         }


        // Ensure supportingDocuments is initialized as an array
        if (!Array.isArray(claim.supportingDocuments)) {
            claim.supportingDocuments = [];
        }

        // Get file paths from the uploaded files
        const filePaths = req.files.map(file => file.path);

        // Add the new file paths to the existing documents array
        claim.supportingDocuments.push(...filePaths);

        await claim.save();

        // Re-populate to return consistent object structure
        const updatedClaim = await Claim.findById(claim._id)
             .populate('policyId')
             .populate('assignedAgent');


        res.status(200).json({
            status: 'success',
            data: {
                claim: updatedClaim
            }
        });
    });
};

// !! REVIEW OR REMOVE THIS FUNCTION !!
// It seems incomplete and doesn't update documents based on request body.
// If the intent was to *replace* or *remove* documents, the logic needs to be added here.
// If the intent was only to *add* documents, uploadSupportingDocuments handles that.
exports.updateUserClaimDocuments = catchAsync(async (req, res, next) => {
   // It's unclear what this function is supposed to do.
   // If it's to update the *list* of documents (e.g., remove one),
   // it needs to accept document identifiers in the body and modify the array.
   // As it stands, it fetches the claim, checks auth (similar to add/upload),
   // but then just saves it without modifying documents based on req.body.
   // This function is likely redundant or needs significant changes.
   // Assuming for now it's not needed or needs to be redefined.

  const claim = await Claim.findById(req.params.id);

  if (!claim) {
    return next(new AppError('No claim found with that ID', 404));
  }

   // Add authorization check similar to getClaim, addClaimNote, uploadSupportingDocuments
   const policy = await Policy.findById(claim.policyId);
   const isCustomerOwner = policy && policy.businessId && policy.businessId.toString() === req.user._id.toString();
   const isAssignedAgent = claim.assignedAgent && claim.assignedAgent.toString() === req.user._id.toString();
   const isAdmin = req.user.role === 'ADMIN';

   if (!isAdmin && !isCustomerOwner && !isAssignedAgent) {
     return next(new AppError('You do not have permission to modify documents for this claim', 403));
   }

  // **MISSING LOGIC**: This function should modify claim.supportingDocuments based on req.body
  // Example (if req.body.documents is an array of *new* document paths - unlikely)
  // if (req.body.documents && Array.isArray(req.body.documents)) {
  //    claim.supportingDocuments = [...claim.supportingDocuments, ...req.body.documents];
  // }
  // Example (if req.body.documents are identifiers to remove)
  // if (req.body.documentsToRemove && Array.isArray(req.body.documentsToRemove)) {
  //    claim.supportingDocuments = claim.supportingDocuments.filter(docPath => !req.body.documentsToRemove.includes(docPath));
  // }
  // ... add the actual document update logic here ...

  // The validation check `if (!claim)` below was incorrect. It should validate request body.
  // if (!claim) { // This check is redundant, already done above
  //     return next(new AppError('Invalid or missing supporting documents', 400)); // This error message is misleading
  // }

  await claim.save(); // Saves the claim, but likely without changes to documents in the current code

  // Re-populate to return consistent object structure (optional, depends on expected return)
   const updatedClaim = await Claim.findById(claim._id)
             .populate('policyId')
             .populate('assignedAgent');


  res.status(200).json({
    status: 'success',
    data: {
      claim: updatedClaim
    }
  });
});

// Delete a claim (admin only) - Keep as is
exports.deleteClaim = catchAsync(async (req, res, next) => {
  // Potential improvement: When deleting a claim, also remove its ID from the assignedClaims array of the assigned agent, if any.
  if (req.user.role !== 'ADMIN') {
    return next(new AppError('You do not have permission to perform this action', 403));
  }

  const claim = await Claim.findByIdAndDelete(req.params.id);

  if (!claim) {
    return next(new AppError('No claim found with that ID', 404));
  }

  // Optional: Clean up assignedClaims on the agent
  if (claim.assignedAgent) {
      await User.findByIdAndUpdate(claim.assignedAgent, {
          $pull: { assignedClaims: claim._id }
      });
  }


  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Get claim statistics (for admins and agents) - Keep as is
exports.getClaimStats = catchAsync(async (req, res, next) => {
  if (!['ADMIN', 'AGENT'].includes(req.user.role)) {
    return next(new AppError('You do not have permission to access this data', 403));
  }

  // If user is an AGENT, filter stats for claims assigned to them
  const matchCondition = req.user.role === 'AGENT' ? { assignedAgent: req.user._id } : {};

  const stats = await Claim.aggregate([
    {
      $match: matchCondition // Add match stage based on user role
    },
    {
      $group: {
        _id: '$claimStatus',
        count: { $sum: 1 },
        totalAmount: { $sum: '$claimAmount' },
        avgAmount: { $avg: '$claimAmount' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

exports.getClaimStatus = catchAsync(async (req, res, next) => {
  const claim = await Claim.findById(req.params.id)
    .populate('policyId') // Populate policy to check ownership
    .populate('assignedAgent'); // Populate assigned agent to check assignment


  if (!claim) {
    return next(new AppError('No claim found with that ID', 404));
  }

   // Check authorization: Admin, Customer owner, or Assigned Agent can view status
  const isCustomerOwner = claim.policyId && claim.policyId.businessId && claim.policyId.businessId.toString() === req.user._id.toString();
  const isAssignedAgent = claim.assignedAgent && claim.assignedAgent._id.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'ADMIN';

  if (!isAdmin && !isCustomerOwner && !isAssignedAgent) {
    return next(new AppError('You do not have permission to view this claim status', 403));
  }


  res.status(200).json({
    status: 'success',
    data: {
      status: claim.claimStatus,
      claimId: claim._id // Include claim ID in the response
    }
  });
});

// Get the count of claims assigned to a specific agent
exports.getclaimCountofAgent = catchAsync(async (req, res, next) => {
   // Restrict this to ADMINs or perhaps the agent themselves? Assuming ADMINs for this example.
   if (req.user.role !== 'ADMIN') {
        return next(new AppError('You do not have permission to view this data', 403));
   }

  const agentId = req.params.agentId;

   // Validate agentId is a valid Mongoose ObjectId
   if (!mongoose.Types.ObjectId.isValid(agentId)) {
        return next(new AppError('Invalid agent ID', 400));
   }

   // Optional: Check if the agent exists and is actually an AGENT
   const agent = await User.findById(agentId);
   if (!agent || agent.role !== 'AGENT') {
        return next(new AppError('No agent found with that ID or the user is not an agent', 404));
   }

  const claimCount = await Claim.countDocuments({ assignedAgent: agentId });

  // The countDocuments method returns a number (0 or more), not null.
  // The 404 error condition based on `claimCount === null` is incorrect.
  // If the count is 0, it just means the agent has no assigned claims, which is a valid response.
  // if (claimCount === null) { // This check is wrong
  //     return next(new AppError('No claims found for this agent', 404));
  // }

  res.status(200).json({
    status: 'success',
    data: {
      agentId: agentId, // Include agent ID
      claimCount: claimCount
    }
  });
});
// Route to get the count of claims assigned to a specific agent
// GET /api/v1/claims/agent/:agentId/count
// Add authorization middleware (e.g., restrictTo('ADMIN')) to this route.

// Add imports needed:
// const User = require('../models/userModel'); // Already added at the top
// const mongoose = require('mongoose'); // Needed for ObjectId validation in getclaimCountofAgent