const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // Import UUID library for taskId generation

const TaskSchema = new mongoose.Schema({
  taskId: {
    type: String,
    unique: true, // Ensure taskId is unique
    default: () => uuidv4(), // Auto-generate UUID for each task
  },
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead', // Reference to the Lead model
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  assignedBy: {
    type: String, // Name or email of the person who assigned the task
    required: true,
  },
  assignedTo: {
    type: String, // Name or ID of the person assigned to the task
    default: null, // Optional, can be null
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium',
  },
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed'], // Add In Progress to allow for mid-task status
    default: 'Not Started',
  },
  postedDate: {
    type: Date,
    default: Date.now,
  },
});

// Create the Task model
const Task = mongoose.model('Task', TaskSchema);

module.exports = Task;
