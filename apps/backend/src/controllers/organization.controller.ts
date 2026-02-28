import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import Organization from '../models/Organization.js';
import User from '../models/User.js';
import Warehouse from '../models/Warehouse.js';
import Product from '../models/Product.js';
import Stock from '../models/Stock.js';

// GET /api/organizations - Liste toutes les organisations (Super Admin)
export const getOrganizations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const organizations = await Organization.find().sort({ createdAt: -1 });
    
    // Ajouter les statistiques pour chaque organisation
    const orgsWithStats = await Promise.all(
      organizations.map(async (org) => {
        const [usersCount, warehousesCount, productsCount] = await Promise.all([
          User.countDocuments({ organizationId: org._id }),
          Warehouse.countDocuments({ organizationId: org._id }),
          Product.countDocuments({ organizationId: org._id }),
        ]);
        
        return {
          ...org.toObject(),
          stats: {
            users: usersCount,
            warehouses: warehousesCount,
            products: productsCount,
          },
        };
      })
    );
    
    res.json(orgsWithStats);
  } catch (error) {
    console.error('Get organizations error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// GET /api/organizations/:id - Détails d'une organisation
export const getOrganization = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const organization = await Organization.findById(id);
    if (!organization) {
      res.status(404).json({ message: 'Organisation non trouvée' });
      return;
    }
    
    // Récupérer les utilisateurs, entrepôts et stats
    const [users, warehouses, productsCount, stocksCount] = await Promise.all([
      User.find({ organizationId: id }).select('-password'),
      Warehouse.find({ organizationId: id }),
      Product.countDocuments({ organizationId: id }),
      Stock.countDocuments({ organizationId: id }),
    ]);
    
    res.json({
      ...organization.toObject(),
      users,
      warehouses,
      stats: {
        users: users.length,
        warehouses: warehouses.length,
        products: productsCount,
        stocks: stocksCount,
      },
    });
  } catch (error) {
    console.error('Get organization error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// POST /api/organizations - Créer une organisation avec son admin
export const createOrganization = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, phone, address, adminEmail, adminPassword, adminFirstName, adminLastName } = req.body;
    
    // Vérifier si l'organisation existe déjà
    const existingOrg = await Organization.findOne({ $or: [{ email }, { name }] });
    if (existingOrg) {
      res.status(400).json({ message: 'Une organisation avec ce nom ou email existe déjà' });
      return;
    }
    
    // Vérifier si l'email admin est déjà utilisé
    const existingUser = await User.findOne({ email: adminEmail });
    if (existingUser) {
      res.status(400).json({ message: 'Cet email admin est déjà utilisé' });
      return;
    }
    
    // Créer l'organisation
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const organization = await Organization.create({
      name,
      slug,
      email,
      phone,
      address,
    });
    
    // Créer l'admin de l'organisation
    const admin = await User.create({
      organizationId: organization._id,
      email: adminEmail,
      password: adminPassword,
      firstName: adminFirstName,
      lastName: adminLastName,
      role: 'admin',
    });
    
    res.status(201).json({
      message: 'Organisation créée avec succès',
      organization: {
        ...organization.toObject(),
        admin: {
          id: admin._id,
          email: admin.email,
          firstName: admin.firstName,
          lastName: admin.lastName,
        },
      },
    });
  } catch (error) {
    console.error('Create organization error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// PUT /api/organizations/:id - Modifier une organisation
export const updateOrganization = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, isActive } = req.body;
    
    const organization = await Organization.findById(id);
    if (!organization) {
      res.status(404).json({ message: 'Organisation non trouvée' });
      return;
    }
    
    // Mettre à jour
    if (name) {
      organization.name = name;
      organization.slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    if (email) organization.email = email;
    if (phone !== undefined) organization.phone = phone;
    if (address !== undefined) organization.address = address;
    if (isActive !== undefined) organization.isActive = isActive;
    
    await organization.save();
    
    res.json({
      message: 'Organisation mise à jour',
      organization,
    });
  } catch (error) {
    console.error('Update organization error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// DELETE /api/organizations/:id - Supprimer une organisation
export const deleteOrganization = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const organization = await Organization.findById(id);
    if (!organization) {
      res.status(404).json({ message: 'Organisation non trouvée' });
      return;
    }
    
    // Supprimer toutes les données liées
    await Promise.all([
      User.deleteMany({ organizationId: id }),
      Warehouse.deleteMany({ organizationId: id }),
      Product.deleteMany({ organizationId: id }),
      Stock.deleteMany({ organizationId: id }),
    ]);
    
    await organization.deleteOne();
    
    res.json({ message: 'Organisation et toutes ses données supprimées' });
  } catch (error) {
    console.error('Delete organization error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// GET /api/organizations/:id/users - Liste des utilisateurs d'une organisation
export const getOrganizationUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const users = await User.find({ organizationId: id })
      .select('-password')
      .populate('warehouseId', 'name')
      .sort({ role: 1, createdAt: -1 });
    
    res.json(users);
  } catch (error) {
    console.error('Get organization users error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// GET /api/organizations/:id/warehouses - Liste des entrepôts d'une organisation
export const getOrganizationWarehouses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const warehouses = await Warehouse.find({ organizationId: id }).sort({ createdAt: -1 });
    
    // Ajouter les stats de stock pour chaque entrepôt
    const warehousesWithStats = await Promise.all(
      warehouses.map(async (wh) => {
        const stocksCount = await Stock.countDocuments({ warehouseId: wh._id });
        const totalQuantity = await Stock.aggregate([
          { $match: { warehouseId: wh._id } },
          { $group: { _id: null, total: { $sum: '$quantity' } } },
        ]);
        
        return {
          ...wh.toObject(),
          stats: {
            stockItems: stocksCount,
            totalQuantity: totalQuantity[0]?.total || 0,
          },
        };
      })
    );
    
    res.json(warehousesWithStats);
  } catch (error) {
    console.error('Get organization warehouses error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// POST /api/organizations/:id/admin - Créer un admin pour une organisation
export const createOrganizationAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { email, password, firstName, lastName } = req.body;
    
    // Vérifier que l'organisation existe
    const organization = await Organization.findById(id);
    if (!organization) {
      res.status(404).json({ message: 'Organisation non trouvée' });
      return;
    }
    
    // Vérifier si l'email est déjà utilisé
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'Cet email est déjà utilisé' });
      return;
    }
    
    // Créer l'admin
    const admin = await User.create({
      organizationId: id,
      email,
      password,
      firstName,
      lastName,
      role: 'admin',
    });
    
    res.status(201).json({
      message: 'Admin créé avec succès',
      admin: {
        id: admin._id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Create organization admin error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// GET /api/organizations/stats/global - Statistiques globales de la plateforme
export const getGlobalStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      organizationsCount,
      usersCount,
      warehousesCount,
      productsCount,
      stocksCount,
    ] = await Promise.all([
      Organization.countDocuments(),
      User.countDocuments({ role: { $ne: 'superadmin' } }),
      Warehouse.countDocuments(),
      Product.countDocuments(),
      Stock.countDocuments(),
    ]);
    
    // Organisations récentes
    const recentOrganizations = await Organization.find()
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.json({
      stats: {
        organizations: organizationsCount,
        users: usersCount,
        warehouses: warehousesCount,
        products: productsCount,
        stocks: stocksCount,
      },
      recentOrganizations,
    });
  } catch (error) {
    console.error('Get global stats error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
