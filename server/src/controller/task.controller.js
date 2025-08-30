import mongoose from 'mongoose';
import { ProjectMember } from '../model/projectmember.model.js';
import { User } from '../model/user.model.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { Task } from '../model/task.model.js';
import ApiResponse from '../utils/ApiResponse.js';
import { AvailableTaskStatus } from '../utils/constent.js';

const createTask = asyncHandler(async (req, res) => {
  const { title, descriptions, assignedTo } = req.body;
  const { projectId } = req.params;

  if (!title || !assignedTo) {
    throw new ApiError(400, 'Title and assignedTo are required');
  }

  const assignedToUser = await User.findOne({ username: assignedTo });
  if (!assignedToUser) {
    throw new ApiError(404, 'Assigned user not found');
  }

  const isValidMember = await ProjectMember.findOne({
    user: assignedToUser._id,
    project: new mongoose.Types.ObjectId(projectId),
  });

  if (!isValidMember) {
    throw new ApiError(404, 'This member is not part of this project');
  }

  const task = await Task.create({
    title: title,
    descriptions: descriptions,
    project: projectId,
    assignedTo: assignedToUser._id,
    assignedBy: req.user?._id,
  });

  return res.status(201).json(new ApiResponse(201, task, 'Task created successfully'));
});

const getTasks = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  // const userId = req.user?._id;

  const getTasks = await Task.find({
    project: new mongoose.Types.ObjectId(projectId),
    // assignedTo: new mongoose.Types.ObjectId(userId),
  })
    .populate('assignedBy', 'username role')
    .populate('assignedTo', 'username role');

  if (!getTasks || getTasks.length === 0) {
    throw new ApiError(404, 'No tasks found for this user in the project');
  }

  return res.status(200).json(new ApiResponse(200, getTasks, 'Tasks retrieved successfully'));
});

const getTaskById = asyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params;

  const getTask = await Task.findOne({
    _id: new mongoose.Types.ObjectId(taskId),
    // assignedTo: req.user._id,
    project: new mongoose.Types.ObjectId(projectId),
  }).populate('assignedTo', 'username role');

  if (!getTask) {
    throw new ApiError(404, 'Task not found');
  }

  return res.status(200).json(new ApiResponse(200, getTask, 'Task retrieved successfully'));
});
const getMemberAllTask = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const memberAllTasks = await Task.aggregate([
    {
      $match: {
        project: new mongoose.Types.ObjectId(projectId),
        assignedTo: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $facet: {
        tasks: [
          {
            $lookup: {
              from: 'projects',
              localField: 'project',
              foreignField: '_id',
              as: 'projectDetials',
            },
          },
          { $unwind: '$projectDetials' },
          {
            $project: {
              _id: 0,
              title: 1,
              descriptions: 1,
              status: 1,
              projectDetials: {
                name:`$projectDetials.name`
              },
              createdAt: 1,
              updatedAt: 1,
            },
          },
        ],
        taskCount: [{ $count: 'count' }],
      },
    },
  ]);
  const taskofUser = [
    { tasks: memberAllTasks[0].tasks },
    { count: memberAllTasks[0].taskCount[0]?.count || 0 },
  ];
  res.status(200).json(new ApiResponse(200, taskofUser, 'Task That only assigned only this user'));
});

const updateTask = asyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params;
  let { title, descriptions } = req.body || {};

  const getTask = await Task.findOne({
    _id: taskId,
    assignedBy: req.user._id,
    project: projectId,
  }).populate('assignedTo', 'username role');

  if (!getTask) {
    throw new ApiError(404, 'Task not found');
  }

  if (!req.user._id.equals(getTask.assignedBy._id)) {
    throw new ApiError(400, 'Only the owner can update the task');
  }

  title = title || getTask.title;
  descriptions = descriptions || getTask.descriptions;

  const updatedTask = await Task.findByIdAndUpdate(
    getTask._id,
    { $set: { title, descriptions } },
    { new: true }
  );

  return res.status(200).json(new ApiResponse(200, updatedTask, 'Task updated successfully'));
});

const updateTaskStatus = asyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params;
  let { status } = req.body || {};

  if (!status) status = AvailableTaskStatus[0];

  if (!AvailableTaskStatus.includes(status)) {
    throw new ApiError(
      400,
      `Invalid status. Allowed values are: ${AvailableTaskStatus.join(', ')}`
    );
  }

  const getTask = await Task.findOne({
    _id: new mongoose.Types.ObjectId(taskId),
    // assignedTo: req.user._id,
    project: new mongoose.Types.ObjectId(projectId),
  }).populate('assignedBy', 'username role');

  if (!getTask) {
    throw new ApiError(404, 'Task not found');
  }

  const updatedTask = await Task.findByIdAndUpdate(
    getTask._id,
    { $set: { status } },
    { new: true }
  );

  return res.status(200).json(new ApiResponse(200, updatedTask, 'Task updated successfully'));
});

const deleteTask = asyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params;

  const getTask = await Task.findOne({
    _id: new mongoose.Types.ObjectId(taskId),
    assignedBy: req.user._id,
    project: new mongoose.Types.ObjectId(projectId),
  }).populate('assignedTo', 'username role');

  if (!getTask) {
    throw new ApiError(404, 'Task not found');
  }

  if (!req.user._id.equals(getTask.assignedBy._id)) {
    throw new ApiError(400, 'Only the owner can delete the task');
  }

  await Task.deleteOne({ _id: getTask._id });

  return res.status(200).json(new ApiResponse(200, {}, 'Task deleted successfully'));
});

export {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getMemberAllTask,
};
