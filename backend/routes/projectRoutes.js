const express = require('express');
const router = express.Router();
const { Project, ProjectMember, User, Task } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');
const { checkProjectRole } = require('../middleware/roleMiddleware');

// @route   GET /api/projects
// @desc    Get all projects the current user is part of
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Get all project memberships for this user
    const memberships = await ProjectMember.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Project,
          include: [
            { model: User, as: 'owner', attributes: ['id', 'name', 'email'] }
          ]
        }
      ]
    });

    // Map memberships to custom response list with user's role on the project
    const projects = memberships.map(m => {
      if (!m.Project) return null;
      return {
        id: m.Project.id,
        name: m.Project.name,
        description: m.Project.description,
        owner: m.Project.owner,
        myRole: m.role,
        createdAt: m.Project.createdAt
      };
    }).filter(Boolean);

    return res.json({ projects });
  } catch (error) {
    console.error('Fetch projects error:', error);
    return res.status(500).json({ error: 'Server error fetching projects.' });
  }
});

// @route   POST /api/projects
// @desc    Create a new project (Creator automatically becomes Admin)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Project name is required.' });
    }

    // Create the project
    const project = await Project.create({
      name,
      description,
      ownerId: req.user.id
    });

    // Add creator to ProjectMember as Admin
    await ProjectMember.create({
      projectId: project.id,
      userId: req.user.id,
      role: 'Admin'
    });

    return res.status(201).json({
      message: 'Project created successfully!',
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        myRole: 'Admin'
      }
    });
  } catch (error) {
    console.error('Create project error:', error);
    return res.status(500).json({ error: 'Server error creating project.' });
  }
});

// @route   GET /api/projects/:projectId
// @desc    Get detailed project by ID (including members and tasks)
router.get('/:projectId', authMiddleware, checkProjectRole(['Admin', 'Member']), async (req, res) => {
  try {
    const project = await Project.findByPk(req.resolvedProjectId, {
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
        {
          model: ProjectMember,
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }]
        }
      ]
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    // Format member profiles and roles nicely
    const members = project.ProjectMembers.map(m => ({
      id: m.user.id,
      name: m.user.name,
      email: m.user.email,
      role: m.role
    }));

    return res.json({
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        owner: project.owner,
        myRole: req.projectRole, // Passed by checkProjectRole middleware
        members
      }
    });
  } catch (error) {
    console.error('Fetch project details error:', error);
    return res.status(500).json({ error: 'Server error fetching project details.' });
  }
});

// @route   DELETE /api/projects/:projectId
// @desc    Delete a project (Only Admin can delete)
router.delete('/:projectId', authMiddleware, checkProjectRole(['Admin']), async (req, res) => {
  try {
    const project = await Project.findByPk(req.resolvedProjectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    // Delete project
    await project.destroy();

    return res.json({ message: 'Project deleted successfully!' });
  } catch (error) {
    console.error('Delete project error:', error);
    return res.status(500).json({ error: 'Server error deleting project.' });
  }
});

// @route   POST /api/projects/:projectId/members
// @desc    Add a member to project (Only Admin can add)
router.post('/:projectId/members', authMiddleware, checkProjectRole(['Admin']), async (req, res) => {
  try {
    const { email, role } = req.body;
    const projectId = req.resolvedProjectId;

    if (!email) {
      return res.status(400).json({ error: 'User email is required.' });
    }

    const assignedRole = role === 'Admin' ? 'Admin' : 'Member';

    // 1. Find user by email
    const userToAdd = await User.findOne({ where: { email } });
    if (!userToAdd) {
      return res.status(404).json({ error: 'User not found. Please verify the email.' });
    }

    // 2. Check if user is already a member
    const existingMember = await ProjectMember.findOne({
      where: { projectId, userId: userToAdd.id }
    });

    if (existingMember) {
      return res.status(400).json({ error: 'User is already a member of this project.' });
    }

    // 3. Create membership
    const newMembership = await ProjectMember.create({
      projectId,
      userId: userToAdd.id,
      role: assignedRole
    });

    return res.status(201).json({
      message: 'Member added successfully!',
      member: {
        id: userToAdd.id,
        name: userToAdd.name,
        email: userToAdd.email,
        role: assignedRole
      }
    });
  } catch (error) {
    console.error('Add project member error:', error);
    return res.status(500).json({ error: 'Server error adding member.' });
  }
});

// @route   DELETE /api/projects/:projectId/members/:userId
// @desc    Remove a member from project (Only Admin can remove)
router.delete('/:projectId/members/:userId', authMiddleware, checkProjectRole(['Admin']), async (req, res) => {
  try {
    const projectId = req.resolvedProjectId;
    const userIdToRemove = Number(req.params.userId);

    // 1. Prevent removing yourself if you are the project owner/admin
    if (userIdToRemove === req.user.id) {
      return res.status(400).json({ error: 'You cannot remove yourself from your own project.' });
    }

    // 2. Find membership
    const membership = await ProjectMember.findOne({
      where: { projectId, userId: userIdToRemove }
    });

    if (!membership) {
      return res.status(404).json({ error: 'User is not a member of this project.' });
    }

    // 3. Destroy membership
    await membership.destroy();

    // 4. Unassign any tasks in this project assigned to this user
    await Task.update(
      { assigneeId: null },
      { where: { projectId, assigneeId: userIdToRemove } }
    );

    return res.json({ message: 'Member removed from project successfully.' });
  } catch (error) {
    console.error('Remove project member error:', error);
    return res.status(500).json({ error: 'Server error removing member.' });
  }
});

module.exports = router;
