import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data
  await prisma.backupCode.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.role.deleteMany();
  await prisma.permission.deleteMany();

  // Create permissions
  const permissions = await Promise.all([
    prisma.permission.create({
      data: {
        name: 'users.read',
        description: 'Read user data',
        resource: 'users',
        action: 'read',
      },
    }),
    prisma.permission.create({
      data: {
        name: 'users.write',
        description: 'Create and update users',
        resource: 'users',
        action: 'write',
      },
    }),
    prisma.permission.create({
      data: {
        name: 'users.delete',
        description: 'Delete users',
        resource: 'users',
        action: 'delete',
      },
    }),
  ]);

  console.log(`✅ Created ${permissions.length} permissions`);

  // Create roles
  const adminRole = await prisma.role.create({
    data: {
      name: 'admin',
      description: 'Administrator role with full access',
      permissions: {
        create: permissions.map((p) => ({
          permission: { connect: { id: p.id } },
        })),
      },
    },
  });

  const userRole = await prisma.role.create({
    data: {
      name: 'user',
      description: 'Regular user role',
      permissions: {
        create: [
          {
            permission: { connect: { id: permissions[0].id } }, // users.read
          },
        ],
      },
    },
  });

  console.log('✅ Created roles: admin, user');

  // Create test users
  const users = await Promise.all([
    // Admin user
    prisma.user.create({
      data: {
        email: 'admin@example.com',
        password: await bcrypt.hash('Admin123!', 10),
        firstName: 'Admin',
        lastName: 'User',
        emailVerified: true,
        active: true,
        roles: {
          create: {
            role: { connect: { id: adminRole.id } },
          },
        },
      },
    }),
    // Regular user
    prisma.user.create({
      data: {
        email: 'user@example.com',
        password: await bcrypt.hash('User123!', 10),
        firstName: 'John',
        lastName: 'Doe',
        emailVerified: true,
        active: true,
        roles: {
          create: {
            role: { connect: { id: userRole.id } },
          },
        },
      },
    }),
    // Unverified user
    prisma.user.create({
      data: {
        email: 'unverified@example.com',
        password: await bcrypt.hash('Test123!', 10),
        firstName: 'Jane',
        lastName: 'Smith',
        emailVerified: false,
        active: true,
        roles: {
          create: {
            role: { connect: { id: userRole.id } },
          },
        },
      },
    }),
    // OAuth user (Google)
    prisma.user.create({
      data: {
        email: 'oauth@example.com',
        password: await bcrypt.hash('OAuth123!', 10),
        firstName: 'OAuth',
        lastName: 'User',
        emailVerified: true,
        active: true,
        oauthProvider: 'google',
        oauthProviderId: 'google-12345',
        roles: {
          create: {
            role: { connect: { id: userRole.id } },
          },
        },
      },
    }),
    // User with 2FA enabled
    prisma.user.create({
      data: {
        email: '2fa@example.com',
        password: await bcrypt.hash('2FA123!', 10),
        firstName: 'TwoFA',
        lastName: 'User',
        emailVerified: true,
        active: true,
        twoFactorEnabled: true,
        twoFactorSecret: 'JBSWY3DPEHPK3PXP',
        backupCodes: {
          create: [
            { code: 'BACKUP-001', used: false },
            { code: 'BACKUP-002', used: false },
            { code: 'BACKUP-003', used: false },
            { code: 'BACKUP-004', used: false },
            { code: 'BACKUP-005', used: false },
          ],
        },
        roles: {
          create: {
            role: { connect: { id: userRole.id } },
          },
        },
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} test users`);

  // Display created users
  console.log('\n📝 Test Users Created:');
  console.log('========================');
  users.forEach((user) => {
    console.log(`Email: ${user.email}`);
    console.log(`Password: See seed file for passwords`);
    console.log('------------------------');
  });

  console.log('\n🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
