const User = require('./User');
const Project = require('./Project');
const ProjectMember = require('./ProjectMember');
const Task = require('./Task');

// 1. User <-> Project Ownership (Creator becomes Admin of the project)
User.hasMany(Project, { foreignKey: 'ownerId', as: 'ownedProjects', onDelete: 'SET NULL' });
Project.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

// 2. Project <-> ProjectMember Relationships
Project.hasMany(ProjectMember, { foreignKey: 'projectId', onDelete: 'CASCADE' });
ProjectMember.belongsTo(Project, { foreignKey: 'projectId' });

User.hasMany(ProjectMember, { foreignKey: 'userId', onDelete: 'CASCADE' });
ProjectMember.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Many-to-Many via ProjectMember (for easy querying)
Project.belongsToMany(User, { 
  through: ProjectMember, 
  foreignKey: 'projectId', 
  otherKey: 'userId',
  as: 'members' 
});
User.belongsToMany(Project, { 
  through: ProjectMember, 
  foreignKey: 'userId', 
  otherKey: 'projectId',
  as: 'projects' 
});

// 3. Project <-> Task Relationships
Project.hasMany(Task, { foreignKey: 'projectId', onDelete: 'CASCADE' });
Task.belongsTo(Project, { foreignKey: 'projectId' });

// 4. Task <-> User (Assignee & Creator)
User.hasMany(Task, { foreignKey: 'assigneeId', as: 'assignedTasks', onDelete: 'SET NULL' });
Task.belongsTo(User, { foreignKey: 'assigneeId', as: 'assignee' });

User.hasMany(Task, { foreignKey: 'creatorId', as: 'createdTasks', onDelete: 'SET NULL' });
Task.belongsTo(User, { foreignKey: 'creatorId', as: 'creator' });

module.exports = {
  User,
  Project,
  ProjectMember,
  Task
};
