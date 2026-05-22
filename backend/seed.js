const bcrypt = require('bcryptjs');
const { User, Project, ProjectMember, Task } = require('./models');

const seedData = async () => {
  try {
    // Check if users already exist to prevent duplicate seeding
    const userCount = await User.count();
    if (userCount > 0) {
      console.log('Database already has data. Skipping automatic seeding.');
      return;
    }

    console.log('Starting database seeding...');

    // 1. Create Mock Users
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    const alice = await User.create({
      name: 'Alice Vance',
      email: 'alice@example.com',
      password: passwordHash
    });

    const bob = await User.create({
      name: 'Bob Miller',
      email: 'bob@example.com',
      password: passwordHash
    });

    const charlie = await User.create({
      name: 'Charlie Smith',
      email: 'charlie@example.com',
      password: passwordHash
    });

    console.log('✓ Mock users created: Alice, Bob, Charlie.');

    // 2. Create Project
    const project = await Project.create({
      name: '🚀 Apollo Space Portal',
      description: 'Designing and building the next-generation mission launch interface, orbital telemetry tracking systems, and astronaut communication systems.',
      ownerId: alice.id
    });

    console.log('✓ Mock project created: Apollo Space Portal.');

    // 3. Create Project Memberships
    // Alice is Admin
    await ProjectMember.create({
      projectId: project.id,
      userId: alice.id,
      role: 'Admin'
    });

    // Bob is Member
    await ProjectMember.create({
      projectId: project.id,
      userId: bob.id,
      role: 'Member'
    });

    // Charlie is Member
    await ProjectMember.create({
      projectId: project.id,
      userId: charlie.id,
      role: 'Member'
    });

    console.log('✓ Mock project memberships initialized (Alice = Admin, Bob & Charlie = Members).');

    // 4. Create Mock Tasks
    const today = new Date();
    
    const formatDate = (dateOffset) => {
      const targetDate = new Date();
      targetDate.setDate(today.getDate() + dateOffset);
      return targetDate.toISOString().split('T')[0];
    };

    // Task 1: Done, assigned to Alice, completed in the past
    await Task.create({
      title: 'Setup central state store & database schemas',
      description: 'Implement backend relational schemas for Users, Projects, and Tasks. Ensure robust indices and cascade delete triggers are validated.',
      status: 'Done',
      priority: 'High',
      dueDate: formatDate(-3), // Due 3 days ago
      projectId: project.id,
      assigneeId: alice.id,
      creatorId: alice.id
    });

    // Task 2: In Progress, assigned to Bob, due tomorrow
    await Task.create({
      title: 'Design glassmorphic launch dashboard',
      description: 'Build premium dark glassmorphism layout for the orbital visualizer panel. Create smooth CSS transitions and ensure responsive widgets.',
      status: 'In Progress',
      priority: 'High',
      dueDate: formatDate(1), // Due tomorrow
      projectId: project.id,
      assigneeId: bob.id,
      creatorId: alice.id
    });

    // Task 3: To Do, assigned to Charlie, due in 3 days
    await Task.create({
      title: 'Integrate telemetry real-time APIs',
      description: 'Establish standard endpoints for live orbital trajectory metrics. Ensure validation schemes reject erroneous inputs.',
      status: 'To Do',
      priority: 'Medium',
      dueDate: formatDate(3), // Due in 3 days
      projectId: project.id,
      assigneeId: charlie.id,
      creatorId: alice.id
    });

    // Task 4: To Do, assigned to Bob, due yesterday (OVERDUE!)
    await Task.create({
      title: 'Write unit tests for JWT authorization',
      description: 'Implement integration testing scripts for token validation and role-based route blocking.',
      status: 'To Do',
      priority: 'Low',
      dueDate: formatDate(-1), // Due yesterday (Overdue!)
      projectId: project.id,
      assigneeId: bob.id,
      creatorId: alice.id
    });

    // Task 5: To Do, unassigned, due in 5 days
    await Task.create({
      title: 'Conduct final release security review',
      description: 'Run automated static code analysis security scanners and review access policies before official deployment.',
      status: 'To Do',
      priority: 'High',
      dueDate: formatDate(5), // Due in 5 days
      projectId: project.id,
      assigneeId: null, // Unassigned
      creatorId: alice.id
    });

    console.log('✓ Mock tasks created (1 Done, 1 In Progress, 2 To Do, 1 Overdue).');
    console.log('Database seeding successfully finished!');
  } catch (error) {
    console.error('Seeding error:', error);
  }
};

module.exports = seedData;
