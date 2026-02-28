const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();
async function main() {
  try {
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    const updated = await prisma.users.updateMany({
      where: { email: 'admin@orthoplus.com' },
      data: { encrypted_password: hashedPassword }
    });
    console.log('Password updated for Admin123! Count:', updated.count);
  } catch (error) {
    console.error(error);
  } finally {
    await prisma['$disconnect']();
  }
}
main();
