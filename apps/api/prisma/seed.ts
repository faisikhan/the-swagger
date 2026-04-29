import { PrismaClient, Role, ProjectStatus, MilestoneStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Cleaning database...');
  await prisma.activityLog.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.document.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  console.log('👥 Creating test users...');
  const password = await bcrypt.hash('Password123!', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@devopsmolvi.com',
      password,
      firstName: 'Alex',
      lastName: 'Admin',
      role: Role.ADMIN,
      isActive: true,
      emailVerified: true,
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: 'manager@devopsmolvi.com',
      password,
      firstName: 'Maya',
      lastName: 'Manager',
      role: Role.DESIGN_MANAGER,
      isActive: true,
      emailVerified: true,
    },
  });

  const client = await prisma.user.create({
    data: {
      email: 'client@devopsmolvi.com',
      password,
      firstName: 'Chris',
      lastName: 'Client',
      role: Role.CLIENT,
      isActive: true,
      emailVerified: true,
    },
  });

  const contractor = await prisma.user.create({
    data: {
      email: 'contractor@devopsmolvi.com',
      password,
      firstName: 'Connor',
      lastName: 'Contractor',
      role: Role.CONTRACTOR,
      isActive: true,
      emailVerified: true,
    },
  });

  const viewer = await prisma.user.create({
    data: {
      email: 'viewer@devopsmolvi.com',
      password,
      firstName: 'Victor',
      lastName: 'Viewer',
      role: Role.VIEWER,
      isActive: true,
      emailVerified: true,
    },
  });

  console.log('📁 Creating sample projects...');

  // Project 1: Active commercial build
  const project1 = await prisma.project.create({
    data: {
      name: 'Horizon Tower – Commercial Fit-Out',
      description: 'Full interior fit-out of floors 12–18 for a tech company HQ.',
      status: ProjectStatus.ACTIVE,
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-08-30'),
      budget: 2_400_000,
      spent: 870_000,
      location: 'Dubai, UAE',
      clientName: 'Horizon Holdings Ltd.',
      ownerId: manager.id,
    },
  });

  await prisma.projectMember.createMany({
    data: [
      { projectId: project1.id, userId: manager.id, role: Role.DESIGN_MANAGER },
      { projectId: project1.id, userId: client.id, role: Role.CLIENT },
      { projectId: project1.id, userId: contractor.id, role: Role.CONTRACTOR },
      { projectId: project1.id, userId: viewer.id, role: Role.VIEWER },
    ],
  });

  const m1 = await prisma.milestone.create({
    data: {
      title: 'Design Sign-Off',
      description: 'Client approves all schematic designs',
      status: MilestoneStatus.COMPLETED,
      dueDate: new Date('2025-02-28'),
      completedAt: new Date('2025-02-25'),
      order: 1,
      projectId: project1.id,
    },
  });

  const m2 = await prisma.milestone.create({
    data: {
      title: 'Structural & MEP Works',
      description: 'Mechanical, electrical, plumbing rough-in',
      status: MilestoneStatus.IN_PROGRESS,
      dueDate: new Date('2025-05-15'),
      order: 2,
      projectId: project1.id,
    },
  });

  await prisma.milestone.create({
    data: {
      title: 'Finishing & Handover',
      description: 'Final finishes, snagging, client handover',
      status: MilestoneStatus.PENDING,
      dueDate: new Date('2025-08-15'),
      order: 3,
      projectId: project1.id,
    },
  });

  await prisma.task.createMany({
    data: [
      {
        title: 'Finalize floor plan layouts',
        description: 'Confirm open-plan zones vs. meeting pods',
        priority: 'HIGH',
        status: 'DONE',
        milestoneId: m1.id,
        projectId: project1.id,
        creatorId: manager.id,
        assigneeId: manager.id,
        completedAt: new Date('2025-02-20'),
      },
      {
        title: 'Submit MEP drawings for approval',
        description: 'Upload coordinated MEP drawings to portal',
        priority: 'URGENT',
        status: 'IN_PROGRESS',
        milestoneId: m2.id,
        projectId: project1.id,
        creatorId: manager.id,
        assigneeId: contractor.id,
        dueDate: new Date('2025-04-30'),
      },
      {
        title: 'Procurement – raised access floor panels',
        priority: 'MEDIUM',
        status: 'TODO',
        milestoneId: m2.id,
        projectId: project1.id,
        creatorId: manager.id,
        assigneeId: contractor.id,
        dueDate: new Date('2025-05-01'),
      },
    ],
  });

  // Project 2: Planning phase
  const project2 = await prisma.project.create({
    data: {
      name: 'Al Barsha Villa Renovation',
      description: 'Complete renovation of a 6-bedroom villa including landscape.',
      status: ProjectStatus.PLANNING,
      startDate: new Date('2025-06-01'),
      endDate: new Date('2026-01-31'),
      budget: 950_000,
      spent: 12_000,
      location: 'Al Barsha, Dubai',
      clientName: 'Private Client',
      ownerId: manager.id,
    },
  });

  await prisma.projectMember.createMany({
    data: [
      { projectId: project2.id, userId: manager.id, role: Role.DESIGN_MANAGER },
      { projectId: project2.id, userId: client.id, role: Role.CLIENT },
    ],
  });

  await prisma.milestone.createMany({
    data: [
      {
        title: 'Concept Design',
        status: MilestoneStatus.IN_PROGRESS,
        dueDate: new Date('2025-05-20'),
        order: 1,
        projectId: project2.id,
      },
      {
        title: 'Detailed Design & BOQ',
        status: MilestoneStatus.PENDING,
        dueDate: new Date('2025-07-01'),
        order: 2,
        projectId: project2.id,
      },
    ],
  });

  // Project 3: Completed
  const project3 = await prisma.project.create({
    data: {
      name: 'Marina Walk Retail Units',
      description: 'Design and fit-out of 4 retail units at Marina Walk.',
      status: ProjectStatus.COMPLETED,
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-11-30'),
      budget: 680_000,
      spent: 672_000,
      location: 'Dubai Marina, UAE',
      clientName: 'Marina Retail Group',
      ownerId: admin.id,
    },
  });

  await prisma.projectMember.createMany({
    data: [
      { projectId: project3.id, userId: admin.id, role: Role.ADMIN },
      { projectId: project3.id, userId: manager.id, role: Role.DESIGN_MANAGER },
      { projectId: project3.id, userId: contractor.id, role: Role.CONTRACTOR },
    ],
  });

  console.log('\n✅ Seed complete!\n');
  console.log('─────────────────────────────────────────────');
  console.log('Test Credentials (all passwords: Password123!)');
  console.log('─────────────────────────────────────────────');
  console.log('admin@devopsmolvi.com       → ADMIN');
  console.log('manager@devopsmolvi.com     → DESIGN_MANAGER');
  console.log('client@devopsmolvi.com      → CLIENT');
  console.log('contractor@devopsmolvi.com  → CONTRACTOR');
  console.log('viewer@devopsmolvi.com      → VIEWER');
  console.log('─────────────────────────────────────────────\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
