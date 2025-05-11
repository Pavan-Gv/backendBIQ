const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Policy = require('../models/policyModel');

// Load environment variables
dotenv.config({ path: "../config.env"}); 

// Connect to MongoDB
mongoose.connect(process.env.DATABASE)
.then(() => 
    console.log('DB connection successful!')
)
.catch((error) => {
    console.error("DB connection failed:", error.message); 
    process.exit(1);
  });

// Read JSON file
const policies = JSON.parse(
  fs.readFileSync("../dummyData/policies.json", 'utf-8')
);

// Import data into DB
const importData = async () => {
  try {
    await Policy.create(policies);
    console.log('Policy data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// Delete all data from collection
const deleteData = async () => {
  try {
    await Policy.deleteMany();
    console.log('Policy data successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

// Usage:
// node seeders/seedPolicies.js --import
// node seeders/seedPolicies.js --delete