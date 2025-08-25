import { Project } from "../model/project.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

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


export { createProject , updateProject,deleteProject,getAllProject};
