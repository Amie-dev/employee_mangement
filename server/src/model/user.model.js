import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto'


const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: {
        url: String,
        localPath: String,
        public_id: String,
      },
      // required: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerifiedExpiry: {
      type: Date,
    },
    emailVerifiedToken: {
      type: String,
    },
    refreshToken: {
      type: String,
    },
    forgotPasswordToken: {
      type: String,
    },
    forgotPasswordExpiry: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (err) {
    next(err);
  }
});


userSchema.methods.isCorrectPassword = async function (password) {
  return await bcrypt.compare(password,this.password)
};

userSchema.methods.generateAccessToken=async function () {
  return jwt.sign(
    {
      _id:this._id
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
  )
}
userSchema.methods.generateRefreshToken=async function () {
  return jwt.sign(
    {
      _id:this._id,
      username:this.username,
      fullName:this.fullName
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
  )
}

userSchema.methods.generateTemporaryToken=async function () {
  const unHashToken= crypto.randomBytes(20).toString("hex")

  const hashToken=crypto.createHash("sha256").update(unHashToken).digest("hex")

  const tokenExpiry=Date.now()+(20*60*1000)

  return {unHashToken,hashToken,tokenExpiry}
}

export const User = mongoose.model('User', userSchema);
