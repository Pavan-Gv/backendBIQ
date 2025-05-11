const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/userModel');

dotenv.config({ path: '../config.env' });

mongoose.connect(process.env.DATABASE)
  .then(() => console.log('DB connection successful!'))
  .catch((error) => {
    console.error("DB connection failed:", error.message);
    process.exit(1);
  });

// Read JSON file
const users = JSON.parse(
  fs.readFileSync("../dummyData/users.json", 'utf-8')
);

// Import data into DB
const importData = async () => {
  try {
    await User.create(users, { validateBeforeSave: false });
    console.log('User data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// Delete all data from collection
const deleteData = async () => {
  try {
    await User.deleteMany();
    console.log('User data successfully deleted!');
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
// node seeders/seedUsers.js --import
// node seeders/seedUsers.js --delete
