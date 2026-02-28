import { Response } from 'express';
import Product from '../models/Product.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

export const getProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const products = await Product.find({ 
      organizationId: req.organizationId,
      isActive: true 
    }).sort({ name: 1 });

    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      organizationId: req.organizationId,
    });

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { sku, name, description, category, unit, minThreshold, price } = req.body;

    const product = await Product.create({
      organizationId: req.organizationId,
      sku,
      name,
      description,
      category,
      unit,
      minThreshold,
      price,
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { sku, name, description, category, unit, minThreshold, price, isActive } = req.body;

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.organizationId },
      { sku, name, description, category, unit, minThreshold, price, isActive },
      { new: true, runValidators: true }
    );

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.organizationId },
      { isActive: false },
      { new: true }
    );

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
