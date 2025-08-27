import mongoose from 'mongoose';
import { ProjectNote } from '../model/note.model.js';
import { Project } from '../model/project.model.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';

const createNote = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { content } = req.body;
  const userId = req.user?._id;

  if (!projectId || !content) {
    throw new ApiError(400, 'Project ID and content are required');
  }

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  const createdNote = await ProjectNote.create({
    project: project._id,
    createdBy: userId,
    content,
  });

  const populatedNote = await ProjectNote.findById(createdNote._id)
    .populate('project', 'name description')
    .populate('createdBy', 'username');

  return res
    .status(201)
    .json(new ApiResponse(201, populatedNote, 'Project note created successfully'));
});


const getNotes = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  if (!projectId) {
    throw new ApiError(400, 'Project ID is required');
  }
 
 
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, 'Project not found');
  }
  
  

  const projectNotes = await ProjectNote.aggregate([
    {
      $match: {
        project: new mongoose.Types.ObjectId(projectId)
      }
    },
    {
      $lookup: {
        from: 'projects',
        localField: 'project',
        foreignField: '_id',
        as: 'projectDetails'
      }
    },
    {
      $unwind: '$projectDetails'
    },
    {
      $lookup: {
        from: 'users',
        localField: 'createdBy',
        foreignField: '_id',
        as: 'createdByUser'
      }
    },
    {
      $unwind: '$createdByUser'
    },
    {
      $project: {
        _id: 1,
        content: 1,
        createdAt: 1,
        createdBy: '$createdByUser.username',
        projectDetails: {
          _id: '$projectDetails._id',
          name: '$projectDetails.name',
          description: '$projectDetails.description'
        }
      }
    }
  ]);

  if (projectNotes.length === 0) {
    throw new ApiError(404, 'No project notes found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, projectNotes, 'Successfully fetched project notes with project details'));
});


const updateNote = asyncHandler(async (req, res) => {
  const { noteId } = req.params;
  let { content } = req.body || {};

  if (!noteId) {
    throw new ApiError(400, 'Note ID is required');
  }

  const getNote = await ProjectNote.findById(noteId).populate('createdBy', 'username');
  if (!getNote) {
    throw new ApiError(404, 'Note not found');
  }

  if (!content) {
    content = getNote.content;
  }

  const updatedNote = await ProjectNote.findByIdAndUpdate(
    getNote._id,
    { $set: { content } },
    { new: true }
  ).populate('createdBy', 'username');

  return res.status(200).json(new ApiResponse(200, updatedNote, 'Note successfully updated'));
});

const getNoteById = asyncHandler(async (req, res) => {
  const { noteId } = req.params;

  if (!noteId) {
    throw new ApiError(400, 'Note ID is required');
  }

  const getNote = await ProjectNote.findById(noteId).populate('createdBy', 'username');

  if (!getNote) {
    throw new ApiError(404, 'Note not found');
  }

  return res.status(200).json(new ApiResponse(200, getNote, 'Successfully fetched note'));
});

const deleteNote = asyncHandler(async (req, res) => {
  const { noteId } = req.params;

  if (!noteId) {
    throw new ApiError(400, 'Note ID is required');
  }

  const deletedNote = await ProjectNote.findByIdAndDelete(noteId);

  if (!deletedNote) {
    throw new ApiError(404, 'Note not found or already deleted');
  }

  return res.status(200).json(new ApiResponse(200, {}, 'Note successfully deleted'));
});

export { createNote, getNotes, updateNote, getNoteById, deleteNote };
