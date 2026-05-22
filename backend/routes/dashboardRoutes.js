const express = require('express');
const router = express.Router();
const { Task, ProjectMember, User } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');
const { checkProjectRole } = require('../middleware/roleMiddleware');
const { Op } = require('sequelize');

// @route   GET /api/dashboard/:projectId
// @desc    Retrieve dynamic dashboard stats for a specific project
router.get('/:projectId', authMiddleware, checkProjectRole(['Admin', 'Member']), async (req, res) => {
  try {
    const projectId = req.resolvedProjectId;
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

    // 1. Total Tasks
    const totalTasks = await Task.count({ where: { projectId } });

    // 2. Tasks by Status
    const todoCount = await Task.count({ where: { projectId, status: 'To Do' } });
    const inProgressCount = await Task.count({ where: { projectId, status: 'In Progress' } });
    const doneCount = await Task.count({ where: { projectId, status: 'Done' } });

    // 3. Overdue Tasks (Not completed and due date is before today)
    const overdueCount = await Task.count({
      where: {
        projectId,
        status: { [Op.ne]: 'Done' },
        dueDate: { [Op.lt]: today }
      }
    });

    // 4. Tasks per member
    // Get all members of the project first
    const members = await ProjectMember.findAll({
      where: { projectId },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }]
    });

    const tasksPerMember = [];

    // Query task counts for each member in the project
    for (const member of members) {
      if (!member.user) continue;

      const taskCount = await Task.count({
        where: {
          projectId,
          assigneeId: member.user.id
        }
      });

      tasksPerMember.push({
        userId: member.user.id,
        userName: member.user.name,
        userEmail: member.user.email,
        taskCount
      });
    }

    // Add a bucket for unassigned tasks
    const unassignedCount = await Task.count({
      where: {
        projectId,
        assigneeId: null
      }
    });

    if (unassignedCount > 0) {
      tasksPerMember.push({
        userId: null,
        userName: 'Unassigned',
        userEmail: '',
        taskCount: unassignedCount
      });
    }

    return res.json({
      stats: {
        totalTasks,
        tasksByStatus: {
          'To Do': todoCount,
          'In Progress': inProgressCount,
          'Done': doneCount
        },
        overdueTasks: overdueCount,
        tasksPerMember
      }
    });
  } catch (error) {
    console.error('Fetch dashboard stats error:', error);
    return res.status(500).json({ error: 'Server error generating dashboard statistics.' });
  }
});

module.exports = router;
