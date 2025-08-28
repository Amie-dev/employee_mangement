import mongoose, { Schema } from 'mongoose';
import { AvailableTaskStatus, taskStatusEnum } from '../utils/constent.js';

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    descriptions: {
      type: String,
      trim: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: AvailableTaskStatus,
      default: taskStatusEnum.TODO,
    },
    attachments: {
      type: [
        {
          url: String,
          localUrl: String,
          public_id: String,
          size: String,
          mimiData: String,
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const Task = mongoose.model('Task', taskSchema);
