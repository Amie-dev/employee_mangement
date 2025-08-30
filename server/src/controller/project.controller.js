import { Project } from '../model/project.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import mongoose from 'mongoose';
import { ProjectMember } from '../model/projectmember.model.js';
import { User } from '../model/user.model.js';
import { userRoleEnum } from '../utils/constent.js';
import { ProjectNote } from '../model/note.model.js';
import { Task } from '../model/task.model.js';

const createProject = asyncHandler(async (req, res) => {
  const { name, descriptions } = req.body;
  const createdBy = req.user?._id;

  if (!name || !createdBy) {
    throw new ApiError(400, 'Project name and createdBy are required.');
  }

  const project = await Project.create({
    name,
    descriptions,
    createdBy,
  });

  if (!project) {
    throw new ApiError(500, 'Failed to create project due to a server error.');
  }
  await ProjectMember.create({
    user: createdBy,
    project: project._id,
    role: userRoleEnum.PROJECT_ADMIN,
  });

  res.status(201).json(new ApiResponse(201, project, 'Successfully created project'));
});

const updateProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { name, descriptions } = req.body || {};

  const existingProject = await Project.findById(projectId);
  if (!existingProject) {
    throw new ApiError(404, 'Project not found');
  }

  // Update only if new values are provided
  if (!name) name = existingProject.name;
  if (descriptions) existingProject.descriptions = descriptions;

  const updatedProject = await existingProject.save();

  res.status(200).json(new ApiResponse(200, updatedProject, 'Project updated successfully'));
});

const deleteProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  // Delete the project
  const deletedProject = await Project.findByIdAndDelete(projectId);

  if (!deletedProject) {
    throw new ApiError(404, 'Project not found');
  }

  // Delete all project members linked to this project
  await ProjectMember.deleteMany({ project: projectId });

  //Delete all notes linked to this project
  await ProjectNote.deleteMany({ project: projectId })

  //Delete all Task linked to this project

  await Task.deleteMany({ project: projectId })

  return res.status(200).json(new ApiResponse(200, {}, 'Project deleted successfully'));
});

const getAllProject = asyncHandler(async (req, res) => {
  const projects = await Project.find().populate('createdBy', 'username email');

  return res.status(200).json(new ApiResponse(200, projects, 'Projects fetched successfully'));
});

const getProjectById = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId).populate('createdBy', 'username email');

  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  return res.status(200).json(new ApiResponse(200, project, 'Project find by Id successfully'));
});

const addProjectMember = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { username } = req.body;
  //  const userId=req.user?._id;

  const newUser = await User.findOne({
    username,
  });

  if (!newUser) {
    throw new ApiError(400, 'this username user is not exist');
  }

  const userId = newUser?._id;

  // Validate IDs
  if (!mongoose.Types.ObjectId.isValid(projectId) || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, 'Invalid project or user ID');
  }
  // Check if project exists
  const project = await Project.findById(projectId).populate('createdBy', 'username email avatar');
  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  // Check if user is already a member
  const existingMember = await ProjectMember.findOne({
    project: projectId,
    user: userId,
  });
  if (existingMember) {
    throw new ApiError(400, 'User is already a member');
  }
  // Add new member
  const newMember = await ProjectMember.create({
    user: userId,
    project: projectId,
    role: userRoleEnum.MEMBER || 'MEMBER',
  });

  res.status(200).json(new ApiResponse(200, newMember, 'successfully add project member'));
});

const getProjectMember = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, 'Invalid project ID');
  }

  // Check if project exists
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  const members = await ProjectMember.aggregate([
    {
      $match: {
        project: new mongoose.Types.ObjectId(projectId),
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userDetails',
      },
    },
    {
      $unwind: '$userDetails',
    },
    {
      $project: {
        _id: 1,
        role: 1,
        joinedAt: 1,
        'userDetails._id': 1,
        'userDetails.username': 1,
        'userDetails.email': 1,
      },
    },
  ]);

  res.status(200).json(new ApiResponse(200, members, 'Project members retrieved successfully'));
});

// const updateProjectMember = asyncHandler(async (req, res) => {
//   const { projectId, memberId } = req.params;
//   const { role } = req.body || {};
//   // Validate IDs
//   if (!mongoose.Types.ObjectId.isValid(projectId) || !mongoose.Types.ObjectId.isValid(memberId)) {
//     throw new ApiError(400, 'Invalid project or member ID');
//   }

//   // Find and update
//   const updatedMember = await ProjectMember.findOneAndUpdate(
//     { _id: memberId, project: projectId },
//     { $set: { role } },
//     { new: true }
//   ).populate('user', 'username email');

//   if (!updatedMember) {
//     throw new ApiError(404, 'Project member not found');
//   }

//   res.status(200).json(new ApiResponse(200, updatedMember, 'Project member updated successfully'));
// });
const updateProjectMember = asyncHandler(async (req, res) => {
  const { projectId, memberId } = req.params;
  const { role } = req.body || {};
  const requesterId = req.user._id;

  // Validate IDs
  if (!mongoose.Types.ObjectId.isValid(projectId) || !mongoose.Types.ObjectId.isValid(memberId)) {
    throw new ApiError(400, 'Invalid project or member ID');
  }

  // Check if requester is a PROJECT_ADMIN
  const requesterMembership = await ProjectMember.findOne({ user: requesterId, project: projectId });
  if (!requesterMembership || requesterMembership.role !== userRoleEnum.PROJECT_ADMIN) {
    throw new ApiError(403, 'Only project admins can update member roles');
  }

  // Prevent admin from demoting themselves (optional but recommended)
  if (memberId === requesterMembership._id.toString() && role !== userRoleEnum.PROJECT_ADMIN) {
    throw new ApiError(400, 'Admins cannot change their own role');
  }

  // Find and update the member
  const updatedMember = await ProjectMember.findOneAndUpdate(
    { _id: memberId, project: projectId },
    { $set: { role } },
    { new: true }
  ).populate('user', 'username email');

  if (!updatedMember) {
    throw new ApiError(404, 'Project member not found');
  }

  res.status(200).json(new ApiResponse(200, updatedMember, 'Project member updated successfully'));
});

const deleteProjectMember = asyncHandler(async (req, res) => {
  const { projectId, memberId } = req.params;
  const requesterId = req.user._id;

  // Validate IDs
  if (!mongoose.Types.ObjectId.isValid(projectId) || !mongoose.Types.ObjectId.isValid(memberId)) {
    throw new ApiError(400, "Invalid project or member ID");
  }

  // Check if requester is a PROJECT_ADMIN
  const requesterMembership = await ProjectMember.findOne({ user: requesterId, project: projectId });
  if (!requesterMembership || requesterMembership.role !== userRoleEnum.PROJECT_ADMIN) {
    throw new ApiError(403, "Only project admins can delete members");
  }

  // Prevent admin from deleting themselves (optional but recommended)
  if (memberId === requesterMembership._id.toString()) {
    throw new ApiError(400, "Admins cannot remove themselves");
  }

  // Delete the member
  const deletedMember = await ProjectMember.findOneAndDelete({ _id: memberId, project: projectId });
  if (!deletedMember) {
    throw new ApiError(404, "Project member not found");
  }

  res.status(200).json(new ApiResponse(200, {}, "Project member deleted successfully"));
});


export {
  createProject,
  updateProject,
  deleteProject,
  getAllProject,
  getProjectById,
  addProjectMember,
  getProjectMember,
  updateProjectMember,
  deleteProjectMember,
};
