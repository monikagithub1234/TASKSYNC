const { ProjectMember, Task } = require('../models');

/**
 * Middleware to check if the user has the required role (Admin/Member) in the project.
 * It automatically looks for projectId in:
 * 1. URL params (:projectId)
 * 2. URL params (:taskId) - by resolving the task first
 * 3. Request body (req.body.projectId)
 * 4. Query string (req.query.projectId)
 * 
 * @param {Array<string>} allowedRoles - e.g. ['Admin'] or ['Admin', 'Member']
 */
const checkProjectRole = (allowedRoles = ['Admin', 'Member']) => {
  return async (req, res, next) => {
    try {
      let projectId = req.params.projectId || req.body.projectId || req.query.projectId;

      // If no direct projectId, but there is a taskId, look up the task's project
      const taskId = req.params.taskId;
      if (!projectId && taskId) {
        const task = await Task.findByPk(taskId);
        if (!task) {
          return res.status(404).json({ error: 'Task not found' });
        }
        projectId = task.projectId;
        // Keep the resolved task in req.task to avoid fetching it again in the controller!
        req.task = task;
      }

      if (!projectId) {
        return res.status(400).json({ error: 'Project ID is required for this operation.' });
      }

      // Check if user is a member of the project and get their role
      const membership = await ProjectMember.findOne({
        where: {
          projectId,
          userId: req.user.id
        }
      });

      if (!membership) {
        return res.status(403).json({ error: 'Access denied. You are not a member of this project.' });
      }

      // Check if membership role is allowed
      if (!allowedRoles.includes(membership.role)) {
        return res.status(403).json({ 
          error: `Access denied. Requires one of these project roles: ${allowedRoles.join(', ')}. Your current role is: ${membership.role}` 
        });
      }

      // Attach membership and resolved projectId for downstream use in controllers
      req.projectRole = membership.role;
      req.resolvedProjectId = Number(projectId);
      next();
    } catch (error) {
      console.error('Role validation error:', error);
      return res.status(500).json({ error: 'Internal server error validating project role.' });
    }
  };
};

module.exports = {
  checkProjectRole
};
