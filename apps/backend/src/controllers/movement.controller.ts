import { Response } from 'express';
import mongoose from 'mongoose';
import Stock from '../models/Stock.js';
import StockMovement from '../models/StockMovement.js';
import Product from '../models/Product.js';
import Warehouse from '../models/Warehouse.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import { sendLowStockAlert } from '../services/email.service.js';

export const getMovements = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const movements = await StockMovement.find({ organizationId: req.organizationId })
      .populate('productId', 'name sku')
      .populate('sourceWarehouseId', 'name')
      .populate('destinationWarehouseId', 'name')
      .populate('performedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(movements);
  } catch (error) {
    console.error('Get movements error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createEntry = async (req: AuthRequest, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { productId, warehouseId, quantity, reason, reference } = req.body;

    // Update or create stock
    let stock = await Stock.findOne({
      organizationId: req.organizationId,
      productId,
      warehouseId,
    });

    if (stock) {
      stock.quantity += quantity;
      stock.lastUpdated = new Date();
      await stock.save({ session });
    } else {
      stock = await Stock.create(
        [{
          organizationId: req.organizationId,
          productId,
          warehouseId,
          quantity,
        }],
        { session }
      ).then((docs) => docs[0]);
    }

    // Create movement record
    const movement = await StockMovement.create(
      [{
        organizationId: req.organizationId,
        productId,
        destinationWarehouseId: warehouseId,
        type: 'entry',
        quantity,
        reason,
        reference,
        performedBy: req.user?._id,
      }],
      { session }
    );

    await session.commitTransaction();
    res.status(201).json({ message: 'Stock entry created', movement: movement[0] });
  } catch (error) {
    await session.abortTransaction();
    console.error('Create entry error:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    session.endSession();
  }
};

export const createExit = async (req: AuthRequest, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { productId, warehouseId, quantity, reason, reference } = req.body;

    const stock = await Stock.findOne({
      organizationId: req.organizationId,
      productId,
      warehouseId,
    });

    if (!stock || stock.quantity < quantity) {
      res.status(400).json({ message: 'Insufficient stock' });
      await session.abortTransaction();
      return;
    }

    stock.quantity -= quantity;
    stock.lastUpdated = new Date();
    await stock.save({ session });

    const movement = await StockMovement.create(
      [{
        organizationId: req.organizationId,
        productId,
        sourceWarehouseId: warehouseId,
        type: 'exit',
        quantity,
        reason,
        reference,
        performedBy: req.user?._id,
      }],
      { session }
    );

    await session.commitTransaction();

    // Check for low stock alert
    await checkAndSendLowStockAlert(productId, warehouseId, stock.quantity);

    res.status(201).json({ message: 'Stock exit created', movement: movement[0] });
  } catch (error) {
    await session.abortTransaction();
    console.error('Create exit error:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    session.endSession();
  }
};

export const createTransfer = async (req: AuthRequest, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { productId, sourceWarehouseId, destinationWarehouseId, quantity, reason, reference } = req.body;

    // Check source stock
    const sourceStock = await Stock.findOne({
      organizationId: req.organizationId,
      productId,
      warehouseId: sourceWarehouseId,
    });

    if (!sourceStock || sourceStock.quantity < quantity) {
      res.status(400).json({ message: 'Insufficient stock in source warehouse' });
      await session.abortTransaction();
      return;
    }

    // Debit source
    sourceStock.quantity -= quantity;
    sourceStock.lastUpdated = new Date();
    await sourceStock.save({ session });

    // Credit destination
    let destStock = await Stock.findOne({
      organizationId: req.organizationId,
      productId,
      warehouseId: destinationWarehouseId,
    });

    if (destStock) {
      destStock.quantity += quantity;
      destStock.lastUpdated = new Date();
      await destStock.save({ session });
    } else {
      destStock = await Stock.create(
        [{
          organizationId: req.organizationId,
          productId,
          warehouseId: destinationWarehouseId,
          quantity,
        }],
        { session }
      ).then((docs) => docs[0]);
    }

    // Create movement record
    const movement = await StockMovement.create(
      [{
        organizationId: req.organizationId,
        productId,
        sourceWarehouseId,
        destinationWarehouseId,
        type: 'transfer',
        quantity,
        reason,
        reference,
        performedBy: req.user?._id,
      }],
      { session }
    );

    await session.commitTransaction();

    // Check for low stock alerts
    await checkAndSendLowStockAlert(productId, sourceWarehouseId, sourceStock.quantity);

    res.status(201).json({ message: 'Transfer completed', movement: movement[0] });
  } catch (error) {
    await session.abortTransaction();
    console.error('Create transfer error:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    session.endSession();
  }
};

async function checkAndSendLowStockAlert(
  productId: string,
  warehouseId: string,
  currentQuantity: number
): Promise<void> {
  try {
    const product = await Product.findById(productId);
    const warehouse = await Warehouse.findById(warehouseId);

    if (!product || !warehouse) return;

    if (currentQuantity < product.minThreshold && warehouse.managerEmail) {
      await sendLowStockAlert(
        warehouse.managerEmail,
        product.name,
        warehouse.name,
        currentQuantity,
        product.minThreshold
      );
    }
  } catch (error) {
    console.error('Error sending low stock alert:', error);
  }
}
