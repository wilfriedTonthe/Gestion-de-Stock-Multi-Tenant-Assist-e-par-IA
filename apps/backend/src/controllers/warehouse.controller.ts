import { Response } from 'express';
import Warehouse from '../models/Warehouse.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

export const getWarehouses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const warehouses = await Warehouse.find({ 
      organizationId: req.organizationId,
      isActive: true 
    }).sort({ name: 1 });

    res.json(warehouses);
  } catch (error) {
    console.error('Get warehouses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getWarehouse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const warehouse = await Warehouse.findOne({
      _id: req.params.id,
      organizationId: req.organizationId,
    });

    if (!warehouse) {
      res.status(404).json({ message: 'Warehouse not found' });
      return;
    }

    res.json(warehouse);
  } catch (error) {
    console.error('Get warehouse error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createWarehouse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, type, address, city, country, managerEmail } = req.body;

    const warehouse = await Warehouse.create({
      organizationId: req.organizationId,
      name,
      type,
      address,
      city,
      country,
      managerEmail,
    });

    res.status(201).json(warehouse);
  } catch (error) {
    console.error('Create warehouse error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateWarehouse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, type, address, city, country, managerEmail, isActive } = req.body;

    const warehouse = await Warehouse.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.organizationId },
      { name, type, address, city, country, managerEmail, isActive },
      { new: true, runValidators: true }
    );

    if (!warehouse) {
      res.status(404).json({ message: 'Warehouse not found' });
      return;
    }

    res.json(warehouse);
  } catch (error) {
    console.error('Update warehouse error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteWarehouse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const warehouse = await Warehouse.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.organizationId },
      { isActive: false },
      { new: true }
    );

    if (!warehouse) {
      res.status(404).json({ message: 'Warehouse not found' });
      return;
    }

    res.json({ message: 'Warehouse deleted successfully' });
  } catch (error) {
    console.error('Delete warehouse error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
