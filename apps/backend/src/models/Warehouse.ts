import mongoose, { Document, Schema, Types } from 'mongoose';

export type WarehouseType = 'factory' | 'warehouse' | 'store';

export interface IWarehouse extends Document {
  organizationId: Types.ObjectId;
  name: string;
  type: WarehouseType;
  address: string;
  city: string;
  country: string;
  managerId?: Types.ObjectId;
  managerEmail?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const warehouseSchema = new Schema<IWarehouse>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Warehouse name is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['factory', 'warehouse', 'store'],
      required: [true, 'Warehouse type is required'],
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
    },
    managerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    managerEmail: {
      type: String,
      lowercase: true,
      trim: true,
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
warehouseSchema.index({ organizationId: 1, name: 1 }, { unique: true });

export default mongoose.model<IWarehouse>('Warehouse', warehouseSchema);
