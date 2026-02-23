import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/modules/auth/model.js';

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);
console.log('MongoDB connected');

const createAdmin = async () => {
  const exists = await User.findOne({ email: 'admin@gmail.com' });
  if (exists) {
    console.log('Admin already exists');
    process.exit();
  }

  const admin = await User.create({
    name: 'Super Admin',
    email: 'admin@gmail.com',
    password: 'Admin@123', 
    role: 'admin',
    isActive: true
  });

  console.log('Admin user created successfully');
  process.exit();
};

createAdmin();
