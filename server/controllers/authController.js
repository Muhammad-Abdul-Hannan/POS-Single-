import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { signToken } from '../utils/token.js';

export async function login(req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  const user = await User.findOne({ username: username.toLowerCase() });
  if (!user || !user.active) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = signToken(user);
  res.json({
    token,
    user: { id: user._id, name: user.name, username: user.username, role: user.role },
  });
}

export async function me(req, res) {
  const user = await User.findById(req.user.id).select('-passwordHash');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
}

// Owner-only: create staff/owner accounts
export async function createUser(req, res) {
  const { name, username, password, role } = req.body;
  if (!name || !username || !password) {
    return res.status(400).json({ message: 'Name, username, and password are required' });
  }

  const existing = await User.findOne({ username: username.toLowerCase() });
  if (existing) {
    return res.status(409).json({ message: 'Username already taken' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    username: username.toLowerCase(),
    passwordHash,
    role: role === 'owner' ? 'owner' : 'staff',
  });

  res.status(201).json({ id: user._id, name: user.name, username: user.username, role: user.role });
}

export async function listUsers(req, res) {
  const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
  res.json(users);
}
