import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Organization from '../models/Organization.js';
import User from '../models/User.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

const generateToken = (userId: string, organizationId?: string): string => {
  const secret = process.env.JWT_SECRET || 'default_secret';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ userId, organizationId: organizationId || null }, secret, { expiresIn } as jwt.SignOptions);
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { organizationName, email, password, firstName, lastName } = req.body;

    // Check if organization already exists
    const existingOrg = await Organization.findOne({ email });
    if (existingOrg) {
      res.status(400).json({ message: 'Organization with this email already exists' });
      return;
    }

    // Create organization
    const slug = organizationName.toLowerCase().replace(/\s+/g, '-');
    const organization = await Organization.create({
      name: organizationName,
      slug,
      email,
    });

    // Create admin user
    const user = await User.create({
      organizationId: organization._id,
      email,
      password,
      firstName,
      lastName,
      role: 'admin',
    });

    const token = generateToken(user._id.toString(), organization._id.toString());

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      organization: {
        id: organization._id,
        name: organization.name,
        slug: organization.slug,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user with password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    if (!user.isActive) {
      res.status(401).json({ message: 'Account is deactivated' });
      return;
    }

    // Vérifier si l'organisation est bloquée (sauf pour superadmin)
    if (user.role !== 'superadmin' && user.organizationId) {
      const organization = await Organization.findById(user.organizationId);
      if (!organization) {
        res.status(401).json({ message: 'Organisation non trouvée' });
        return;
      }
      if (!organization.isActive) {
        res.status(403).json({ 
          message: 'Votre entreprise a été suspendue. Contactez l\'administrateur de la plateforme.',
          code: 'ORGANIZATION_BLOCKED'
        });
        return;
      }
    }

    const token = generateToken(user._id.toString(), user.organizationId?.toString());

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const organization = await Organization.findById(req.organizationId);

    res.json({
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      organization: organization
        ? {
            id: organization._id,
            name: organization.name,
            slug: organization.slug,
          }
        : null,
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
