import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IProduct extends Document {
  organizationId: Types.ObjectId;
  sku: string;
  name: string;
  description?: string;
  category: string;
  unit: string;
  minThreshold: number;
  price?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      trim: true,
      default: 'pcs',
    },
    minThreshold: {
      type: Number,
      default: 10,
      min: 0,
    },
    price: {
      type: Number,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for multi-tenancy
productSchema.index({ organizationId: 1, sku: 1 }, { unique: true });

export default mongoose.model<IProduct>('Product', productSchema);
