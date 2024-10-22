const express = require('express');
const router = express.Router();
const Task = require('../models/Task'); // Import the Task model

// POST route to create a new task
router.post('/', async (req, res) => {
  const { leadId, title, description, dueDate, assignedBy, assignedTo, priority, status } = req.body;

  // Validation for required fields
  if (!leadId || !title || !description || !dueDate || !assignedBy) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Create a new task with the provided data
    const newTask = new Task({
      leadId,
      title,
      description,
      dueDate,
      assignedBy,
      assignedTo,
      priority: priority || 'Medium', // Use provided priority or default
      status: status || 'Not Started', // Use provided status or default
    });

    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Error creating task' });
  }
});

// GET route to fetch tasks for a specific lead, sorted by postedDate in descending order
router.get('/:leadId', async (req, res) => {
  try {
    const tasks = await Task.find({ leadId: req.params.leadId }).sort({ postedDate: -1 });

    // Return an empty array if no tasks are found, but respond with 200 OK
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Error fetching tasks' });
  }
});



// PUT route to update task status using MongoDB's _id field
router.put('/update-task/:id', async (req, res) => {
  const { id } = req.params; // Use _id from the route
  const { status } = req.body;

  // Ensure the status is valid
  const validStatuses = ['Not Started', 'In Progress', 'Completed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    // Find the task by its MongoDB _id and update its status
    const updatedTask = await Task.findByIdAndUpdate(
      id, // Use _id to find the task
      { status: status }, // Update the status field
      { new: true } // Return the updated document
    );

    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Error updating task' });
  }
});

module.exports = router;
