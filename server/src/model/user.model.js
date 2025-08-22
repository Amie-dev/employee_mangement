import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    avater: {
      typ: {
        url: String,
        localPath: String,
        public_id: String,
      },
      required: true,
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
    isEmailVerifiedToken: {
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

export const User = mongoose.model('User', userSchema);
