import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.users.findFirst({ where: { email: 'admin@orthoplus.com' } });
  console.log('User found:', user ? user.email : 'NOT FOUND');
  if (user && user.encrypted_password) {
    const isMatch = await bcrypt.compare('Admin123!', user.encrypted_password);
    console.log('Password match for Admin123!:', isMatch);
  } else {
    console.log('No encrypted_password found or user missing');
  }
}
main().catch(console.error).finally(() => prisma.());
