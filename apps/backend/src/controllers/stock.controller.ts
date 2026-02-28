import { Response } from 'express';
import Stock from '../models/Stock.js';
import Product from '../models/Product.js';
import Warehouse from '../models/Warehouse.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

export const getStocks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const stocks = await Stock.find({ organizationId: req.organizationId })
      .populate('productId', 'name sku category')
      .populate('warehouseId', 'name type city')
      .sort({ 'productId.name': 1 });

    res.json(stocks);
  } catch (error) {
    console.error('Get stocks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getStocksByWarehouse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const stocks = await Stock.find({ 
      organizationId: req.organizationId,
      warehouseId: req.params.id 
    })
      .populate('productId', 'name sku category minThreshold')
      .populate('warehouseId', 'name type');

    res.json(stocks);
  } catch (error) {
    console.error('Get stocks by warehouse error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getStockAlerts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const stocks = await Stock.find({ organizationId: req.organizationId })
      .populate('productId', 'name sku category minThreshold')
      .populate('warehouseId', 'name type city managerEmail');

    // Filter stocks below threshold
    const alerts = stocks.filter((stock) => {
      const product = stock.productId as unknown as { minThreshold: number };
      return stock.quantity < (product?.minThreshold || 10);
    });

    res.json(alerts);
  } catch (error) {
    console.error('Get stock alerts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [totalProducts, totalWarehouses, totalStocks, lowStockCount] = await Promise.all([
      Product.countDocuments({ organizationId: req.organizationId, isActive: true }),
      Warehouse.countDocuments({ organizationId: req.organizationId, isActive: true }),
      Stock.find({ organizationId: req.organizationId }).populate('productId', 'minThreshold'),
      Stock.aggregate([
        { $match: { organizationId: req.organizationId } },
        {
          $lookup: {
            from: 'products',
            localField: 'productId',
            foreignField: '_id',
            as: 'product',
          },
        },
        { $unwind: '$product' },
        { $match: { $expr: { $lt: ['$quantity', '$product.minThreshold'] } } },
        { $count: 'count' },
      ]),
    ]);

    const totalStockValue = totalStocks.reduce((acc, stock) => acc + stock.quantity, 0);

    res.json({
      totalProducts,
      totalWarehouses,
      totalStockItems: totalStockValue,
      lowStockAlerts: lowStockCount[0]?.count || 0,
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
