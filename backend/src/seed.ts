import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding default users...');

  // Create a default organization
  let org = await prisma.organization.findFirst({
    where: { name: 'Rajalakshmi Edu' }
  });

  if (!org) {
    org = await prisma.organization.create({
      data: {
        name: 'Rajalakshmi Edu'
      }
    });
    console.log(`Created default organization: ${org.name}`);
  }

  const users = [
    {
      name: 'Aditya Kumar',
      email: 'executive@rajalakshmi.edu.in',
      password: 'executive123',
      role: Role.OWNER
    },
    {
      name: 'Hari Prasad',
      email: 'strategist@rajalakshmi.edu.in',
      password: 'strategist123',
      role: Role.ADMIN
    },
    {
      name: 'Dr. Anand K. (CSE)',
      email: 'admin@rajalakshmi.edu.in',
      password: 'admin123',
      role: Role.ADMIN
    }
  ];

  for (const u of users) {
    const existing = await prisma.user.findUnique({
      where: { email: u.email }
    });

    if (!existing) {
      const passwordHash = await bcrypt.hash(u.password, 10);
      const created = await prisma.user.create({
        data: {
          name: u.name,
          email: u.email,
          passwordHash,
          role: u.role,
          organizationId: org.id,
          emailVerified: true,
          onboardingCompleted: true // pre-approve onboarding to access dashboard features
        }
      });
      console.log(`Created user: ${created.name} (${created.email}) with password: ${u.password}`);
    } else {
      console.log(`User ${u.email} already exists.`);
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
