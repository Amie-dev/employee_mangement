import { Project } from "../model/project.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import mongoose from "mongoose";
import { ProjectMember } from "../model/projectmember.model.js";

const createProject = asyncHandler(async (req, res) => {
  const { name, descriptions } = req.body;
  const createdBy = req.user?._id;

  if (!name || !createdBy) {
    throw new ApiError(400, "Name and createdBy are required.");
  }

  const project = await Project.create({
    name,
    descriptions,
    createdBy,
  });

  res.status(201).json(
    new ApiResponse(201, project, "Successfully created project")
  );
});
const updateProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { name, descriptions } = req.body || {};

  const existingProject = await Project.findById(projectId);
  if (!existingProject) {
    throw new ApiError(404, "Project not found");
  }
 

  // Update only if new values are provided
  if (name) existingProject.name = name;
  if (descriptions) existingProject.descriptions = descriptions;

  const updatedProject = await existingProject.save();

  res.status(200).json(
    new ApiResponse(200, updatedProject, "Project updated successfully")
  );
});

const deleteProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const deletedProject = await Project.findByIdAndDelete(projectId);

  if (!deletedProject) {
    throw new ApiError(404, "Project not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Project deleted successfully"));
});

const getAllProject = asyncHandler(async (req, res) => {
  const projects = await Project.find();

  return res
    .status(200)
    .json(new ApiResponse(200, projects, "Projects fetched successfully"));
});

const getProjectById = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project find by Id successfully"));
});

const addProjectMember=asyncHandler(async(req,res)=>{
  const { projectId } = req.params;
   const userId=req.user?._id
  // Validate IDs
  if (!mongoose.Types.ObjectId.isValid(projectId) || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400,  "Invalid project or user ID")
  }
  // Check if project exists
  const project=await Project.findById(projectId)
  if (!project) {
    throw new ApiError(404, "Project not found")
  }

    // Check if user is already a member
    const existingMember=await ProjectMember.findOne({
      project:projectId,
      user:userId
    })
    if (existingMember) {
      throw new ApiError(400,  "User is already a member")
    }
    // Add new member
  const newMember = await ProjectMember.create({
    user: userId,
    project: projectId,
    role: role || 'MEMBER',
  });

  res.status(200).json(new ApiResponse(200,newMember,"successfully add project member"))
})

const getProjectMember=asyncHandler(async(req,res)=>{
  const { projectId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid project ID");
  }

  // Check if project exists
  const project=await Project.findById(projectId)
  if (!project) {
    throw new ApiError(404, "Project not found")
  }

  const members=await ProjectMember.aggregate([
    {
      $match:{
        project:new mongoose.Types.ObjectId(projectId)
      }
    },{
      $lookup:{
        from:"users",
        localField:"user",
        foreignField:"_id",
        as: 'userDetails'
      }
    },
    {
      $unwind: '$userDetails'
    },
    {
      $project: {
        _id: 1,
        role: 1,
        joinedAt: 1,
        'userDetails._id': 1,
        'userDetails.name': 1,
        'userDetails.email': 1
      }
    }
  ])

  res.status(200).json(new ApiResponse(200, members, "Project members retrieved successfully"))
})


const updateProjectMember=asyncHandler(async(req,res)=>{
  const { projectId, memberId } = req.params;
  const { role } = req.body || {};
  // Validate IDs
  if (!mongoose.Types.ObjectId.isValid(projectId) || !mongoose.Types.ObjectId.isValid(memberId)) {
    throw new ApiError(400, "Invalid project or member ID");
  }

  // Find and update
  const updatedMember = await ProjectMember.findOneAndUpdate(
    { _id: memberId, project: projectId },
    { $set: { role } },
    { new: true }
  ).populate('user', 'name email');

  if (!updatedMember) {
    throw new ApiError(404, "Project member not found");
  }

  res.status(200).json(new ApiResponse(200, updatedMember, "Project member updated successfully"));
})

export { 
  createProject , 
  updateProject,
  deleteProject,
  getAllProject,
  getProjectById,
  addProjectMember,
  getProjectMember,
  updateProjectMember  
};
