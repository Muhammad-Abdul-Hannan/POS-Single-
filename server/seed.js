import bcrypt from 'bcryptjs';
import 'dotenv/config';
import { connectDB } from './config/db.js';
import User from './models/User.js';

async function seed() {
  await connectDB();

  const existing = await User.findOne({ username: 'owner' });
  if (existing) {
    console.log('Owner account already exists (username: owner). Skipping.');
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash('mahannan121', 10);
  await User.create({
    name: 'Muhammad Abdul Hannan',
    username: 'hannanryk121@gmail.com',
    passwordHash,
    role: 'owner',
  });

  console.log('Owner account created — username: hannanryk121@gmail.com / password: mahannan121');
  console.log('Please log in and change this password.');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
