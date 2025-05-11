const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name']
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 8,
      select: false
    },
    passwordConfirm: {
      type: String,
      validate: {
        validator: function(el) {
            return el === this.password;
          },
          message: 'Passwords are not the same!'
          }
        },
        role: {
          type: String,
          enum: ['ADMIN', 'AGENT', 'CUSTOMER'],
          default: 'CUSTOMER'
        },
        businessType: {
          type: String,
          enum: ['RETAIL', 'MANUFACTURING', 'TECHNOLOGY', 'HEALTHCARE', 'HOSPITALITY', 'CONSTRUCTION', 'OTHER']
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    phone: String,
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false
    }
  },
  {
    timestamps: true
  }
);

userSchema.virtual('policies', {
  ref: 'Policy',
  foreignField: 'businessId',
  localField: '_id'
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    try{
        return await bcrypt.compare(candidatePassword, userPassword);
    }
    catch(err){
        console.error('Error comparing passwords:', error);
        throw new Error('Password comparison failed');
    }
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  
  return false;
};  

const User = mongoose.model('User', userSchema);

module.exports = User;