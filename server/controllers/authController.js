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

// Any authenticated user: change their own password
export async function changeOwnPassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current and new password are required' });
  }
  if (newPassword.length < 4) {
    return res.status(400).json({ message: 'New password must be at least 4 characters' });
  }

  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const match = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!match) return res.status(401).json({ message: 'Current password is incorrect' });

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();
  res.json({ message: 'Password updated' });
}

// Owner-only: reset another user's password (no need to know their old one)
export async function resetUserPassword(req, res) {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 4) {
    return res.status(400).json({ message: 'New password must be at least 4 characters' });
  }

  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();
  res.json({ message: 'Password reset' });
}

// Owner-only: activate/deactivate a staff or owner account.
// We deactivate rather than hard-delete so past sales/grinding logs still show
// who recorded them instead of losing that name once the account is gone.
export async function setUserActive(req, res) {
  const { active } = req.body;
  if (typeof active !== 'boolean') {
    return res.status(400).json({ message: 'active (true/false) is required' });
  }

  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  if (String(user._id) === String(req.user.id) && !active) {
    return res.status(400).json({ message: 'You cannot deactivate your own account' });
  }

  if (user.role === 'owner' && !active) {
    const otherActiveOwners = await User.countDocuments({
      role: 'owner',
      active: true,
      _id: { $ne: user._id },
    });
    if (otherActiveOwners === 0) {
      return res.status(400).json({ message: 'At least one active owner account is required' });
    }
  }

  user.active = active;
  await user.save();
  res.json({ id: user._id, name: user.name, username: user.username, role: user.role, active: user.active });
}