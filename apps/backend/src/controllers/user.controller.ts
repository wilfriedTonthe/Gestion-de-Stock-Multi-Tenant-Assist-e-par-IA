import { Response } from 'express';
import User from '../models/User.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

// Get all users in organization (Admin only)
export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find({ organizationId: req.organizationId })
      .select('-password')
      .populate('warehouseId', 'name type city');

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// Get single user
export const getUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      organizationId: req.organizationId,
    })
      .select('-password')
      .populate('warehouseId', 'name type city');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
};

// Create user (Admin only)
export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, role, warehouseId } = req.body;

    // Check if user already exists in organization
    const existingUser = await User.findOne({
      email,
      organizationId: req.organizationId,
    });

    if (existingUser) {
      res.status(400).json({ message: 'User with this email already exists' });
      return;
    }

    // Validate role
    if (!['admin', 'manager', 'staff'].includes(role)) {
      res.status(400).json({ message: 'Invalid role. Must be admin, manager, or staff' });
      return;
    }

    // Manager and staff must have a warehouseId
    if ((role === 'manager' || role === 'staff') && !warehouseId) {
      res.status(400).json({ message: 'Manager and staff must be assigned to a warehouse' });
      return;
    }

    const user = await User.create({
      organizationId: req.organizationId,
      email,
      password,
      firstName,
      lastName,
      role,
      warehouseId: role === 'admin' ? undefined : warehouseId,
    });

    const userResponse = await User.findById(user._id)
      .select('-password')
      .populate('warehouseId', 'name type city');

    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
};

// Update user (Admin only)
export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, role, warehouseId, isActive } = req.body;

    const user = await User.findOne({
      _id: req.params.id,
      organizationId: req.organizationId,
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Prevent changing own role
    if (req.user?._id.toString() === req.params.id && role && role !== user.role) {
      res.status(400).json({ message: 'Cannot change your own role' });
      return;
    }

    // Validate role if provided
    if (role && !['admin', 'manager', 'staff'].includes(role)) {
      res.status(400).json({ message: 'Invalid role' });
      return;
    }

    // Manager and staff must have a warehouseId
    const newRole = role || user.role;
    if ((newRole === 'manager' || newRole === 'staff') && !warehouseId && !user.warehouseId) {
      res.status(400).json({ message: 'Manager and staff must be assigned to a warehouse' });
      return;
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.role = role || user.role;
    user.isActive = isActive !== undefined ? isActive : user.isActive;
    
    if (newRole === 'admin') {
      user.warehouseId = undefined;
    } else if (warehouseId) {
      user.warehouseId = warehouseId;
    }

    await user.save();

    const updatedUser = await User.findById(user._id)
      .select('-password')
      .populate('warehouseId', 'name type city');

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
};

// Delete user (Admin only)
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Prevent self-deletion
    if (req.user?._id.toString() === req.params.id) {
      res.status(400).json({ message: 'Cannot delete your own account' });
      return;
    }

    const user = await User.findOneAndDelete({
      _id: req.params.id,
      organizationId: req.organizationId,
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
};

// Get users by warehouse (for managers to see their team)
export const getUsersByWarehouse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { warehouseId } = req.params;

    // Manager can only see users in their warehouse
    if (req.user?.role === 'manager' && req.user.warehouseId?.toString() !== warehouseId) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const users = await User.find({
      organizationId: req.organizationId,
      warehouseId,
    })
      .select('-password')
      .populate('warehouseId', 'name type city');

    res.json(users);
  } catch (error) {
    console.error('Error fetching users by warehouse:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};
