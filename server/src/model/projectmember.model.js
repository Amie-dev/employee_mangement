import mongoose, { Schema } from 'mongoose';
import { AvailableUserRole, userRoleEnum } from '../utils/constent.js';

const projectMemberSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
    },
    role: {
      type: String,
      enum: AvailableUserRole,
      default: userRoleEnum.MEMBER,
    },
  },
  {
    timestamps: true,
  }
);

export const ProjectMember = mongoose.model('ProjectMember', projectMemberSchema);
