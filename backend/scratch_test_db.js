const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Testing connection to database...');
  try {
    const start = Date.now();
    const count = await prisma.growthDomainState.count();
    console.log(`Successfully connected! Found ${count} growth domain states in ${Date.now() - start}ms.`);
  } catch (error) {
    console.error('Connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
