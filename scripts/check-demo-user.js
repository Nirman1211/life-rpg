const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany({ select: { id: true, email: true } });
    console.log('TOTAL USERS IN DATABASE:', users.length);
    console.log('USERS IN DB:', users.map(u => u.email));
    const demo = await prisma.user.findUnique({
      where: { email: 'demo@liferpg.app' },
      include: { profile: true, character: true, streak: true, settings: true }
    });
    console.log('DEMO USER FOUND:', !!demo);
    if (demo) {
      console.log('Demo user ID:', demo.id);
      console.log('Demo profile:', demo.profile?.displayName);
      console.log('Demo character level:', demo.character?.level);
    }
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
