const express = require('express');
const router = express.Router();
const { Task, User, ProjectMember } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');
const { checkProjectRole } = require('../middleware/roleMiddleware');

// @route   GET /api/tasks/project/:projectId
// @desc    Get all tasks belonging to a specific project (Admins & Members can view)
router.get('/project/:projectId', authMiddleware, checkProjectRole(['Admin', 'Member']), async (req, res) => {
  try {
    const tasks = await Task.findAll({
      where: { projectId: req.resolvedProjectId },
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.json({ tasks });
  } catch (error) {
    console.error('Fetch tasks error:', error);
    return res.status(500).json({ error: 'Server error fetching tasks.' });
  }
});

// @route   POST /api/tasks
// @desc    Create a new task in a project (Only Admin can create)
router.post('/', authMiddleware, checkProjectRole(['Admin']), async (req, res) => {
  try {
    const { title, description, dueDate, priority, assigneeId, projectId } = req.body;

    if (!title || !dueDate || !projectId) {
      return res.status(400).json({ error: 'Title, Due Date, and Project ID are required.' });
    }

    // If an assignee is provided, check if they are a member of the project
    if (assigneeId) {
      const isMember = await ProjectMember.findOne({
        where: { projectId, userId: assigneeId }
      });
      if (!isMember) {
        return res.status(400).json({ error: 'Assignee must be a member of this project.' });
      }
    }

    // Create task
    const task = await Task.create({
      title,
      description,
      dueDate,
      priority: priority || 'Medium',
      status: 'To Do',
      projectId,
      creatorId: req.user.id,
      assigneeId: assigneeId || null
    });

    // Fetch the task again with user details
    const savedTask = await Task.findByPk(task.id, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] }
      ]
    });

    return res.status(201).json({
      message: 'Task created successfully!',
      task: savedTask
    });
  } catch (error) {
    console.error('Create task error:', error);
    return res.status(500).json({ error: 'Server error creating task.' });
  }
});

// @route   PUT /api/tasks/:taskId
// @desc    Update a task (Admin can update everything; Member can ONLY update STATUS of their ASSIGNED tasks)
router.put('/:taskId', authMiddleware, checkProjectRole(['Admin', 'Member']), async (req, res) => {
  try {
    const task = req.task; // Already resolved and attached by checkProjectRole middleware!
    const userRole = req.projectRole; // Admin or Member
    const { title, description, dueDate, priority, assigneeId, status } = req.body;

    // --- ROLE-BASED ACCESS CONTROL ENFORCEMENT ---
    if (userRole === 'Member') {
      // 1. Members can only update their own assigned tasks
      if (task.assigneeId !== req.user.id) {
        return res.status(403).json({ 
          error: 'Access denied. Members can only update tasks assigned directly to them.' 
        });
      }

      // 2. Members can ONLY update the 'status' field.
      // We block any changes to title, description, dueDate, priority, or assigneeId
      const triedToModifyOtherFields = 
        (title !== undefined && title !== task.title) ||
        (description !== undefined && description !== task.description) ||
        (dueDate !== undefined && dueDate !== task.dueDate) ||
        (priority !== undefined && priority !== task.priority) ||
        (assigneeId !== undefined && assigneeId !== task.assigneeId);

      if (triedToModifyOtherFields) {
        return res.status(403).json({ 
          error: 'Access denied. As a project Member, you are only authorized to update the STATUS of your assigned tasks.' 
        });
      }

      // If status is provided, update ONLY the status
      if (status) {
        if (!['To Do', 'In Progress', 'Done'].includes(status)) {
          return res.status(400).json({ error: 'Invalid status value.' });
        }
        task.status = status;
      }
    } else if (userRole === 'Admin') {
      // Admins have full rights to modify any fields
      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (dueDate !== undefined) task.dueDate = dueDate;
      if (priority !== undefined) task.priority = priority;
      if (status !== undefined) task.status = status;
      
      if (assigneeId !== undefined) {
        // If assigning, verify they are in the project
        if (assigneeId !== null) {
          const isMember = await ProjectMember.findOne({
            where: { projectId: task.projectId, userId: assigneeId }
          });
          if (!isMember) {
            return res.status(400).json({ error: 'Assignee must be a member of this project.' });
          }
        }
        task.assigneeId = assigneeId;
      }
    }

    // Save changes
    await task.save();

    // Re-fetch task with updated relationship models
    const updatedTask = await Task.findByPk(task.id, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] }
      ]
    });

    return res.json({
      message: 'Task updated successfully!',
      task: updatedTask
    });
  } catch (error) {
    console.error('Update task error:', error);
    return res.status(500).json({ error: 'Server error updating task.' });
  }
});

// @route   DELETE /api/tasks/:taskId
// @desc    Delete a task (Only Admin can delete)
router.delete('/:taskId', authMiddleware, checkProjectRole(['Admin']), async (req, res) => {
  try {
    const task = req.task; // Already resolved and attached by checkProjectRole middleware!
    
    await task.destroy();

    return res.json({ message: 'Task deleted successfully!' });
  } catch (error) {
    console.error('Delete task error:', error);
    return res.status(500).json({ error: 'Server error deleting task.' });
  }
});

module.exports = router;
