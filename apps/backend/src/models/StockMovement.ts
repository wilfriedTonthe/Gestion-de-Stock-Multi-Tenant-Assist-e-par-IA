import mongoose, { Document, Schema, Types } from 'mongoose';

export type MovementType = 'entry' | 'exit' | 'transfer';

export interface IStockMovement extends Document {
  organizationId: Types.ObjectId;
  productId: Types.ObjectId;
  sourceWarehouseId?: Types.ObjectId;
  destinationWarehouseId?: Types.ObjectId;
  type: MovementType;
  quantity: number;
  reason?: string;
  reference?: string;
  performedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const stockMovementSchema = new Schema<IStockMovement>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    sourceWarehouseId: {
      type: Schema.Types.ObjectId,
      ref: 'Warehouse',
    },
    destinationWarehouseId: {
      type: Schema.Types.ObjectId,
      ref: 'Warehouse',
    },
    type: {
      type: String,
      enum: ['entry', 'exit', 'transfer'],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    reason: {
      type: String,
      trim: true,
    },
    reference: {
      type: String,
      trim: true,
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for querying movements
stockMovementSchema.index({ organizationId: 1, createdAt: -1 });
stockMovementSchema.index({ organizationId: 1, productId: 1 });

export default mongoose.model<IStockMovement>('StockMovement', stockMovementSchema);
