const bcrypt = require('bcrypt');

module.exports = (mongoose) => {
  const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    index: true
  },
  password: {
    type: String,
    required: true,
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  profile: {
    firstName: {
      type: String,
      trim: true
    },
    lastName: {
      type: String,
      trim: true
    },
    avatar: {
      type: String
    }
  }
}, {
  timestamps: true
});

  userSchema.index({ email: 1, role: 1 });
  userSchema.index({ username: 1, isActive: 1 });

  userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
      return next();
    }
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (error) {
      next(error);
    }
  });

  userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
      return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
      throw error;
    }
  };

  userSchema.methods.toJSON = function() {
    const userObject = this.toObject();
    delete userObject.password;
    return userObject;
  };

  userSchema.statics.findByEmail = function(email) {
    return this.findOne({ email: email.toLowerCase() });
  };

  userSchema.statics.findByUsername = function(username) {
    return this.findOne({ username: username.trim() });
  };

  userSchema.statics.isAdmin = function(userId) {
    return this.findById(userId).then(user => {
      return user && user.role === 'admin';
    });
  };

  return mongoose.models.User || mongoose.model('User', userSchema);
};

