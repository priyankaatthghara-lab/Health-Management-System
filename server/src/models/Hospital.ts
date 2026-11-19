import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IHospital extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  address: string;
  city: string;
  state: string;
  coordinates?: { type: 'Point'; coordinates: [number, number] };
  phone: string;
  email: string;
  website?: string;
  registrationNumber?: string;
  licenseNumber?: string;
  type: 'government' | 'private' | 'nonprofit' | 'blood_bank';
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verificationHistory: Array<{
    status: string;
    reason?: string;
    verifiedBy?: mongoose.Types.ObjectId;
    timestamp: Date;
  }>;
  operatingHours?: string;
  emergencyContact?: string;
  createdAt: Date;
  updatedAt: Date;
}

const pointSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function (val: number[]) {
          return (
            Array.isArray(val) &&
            val.length === 2 &&
            typeof val[0] === 'number' &&
            typeof val[1] === 'number' &&
            val[0] >= -180 &&
            val[0] <= 180 &&
            val[1] >= -90 &&
            val[1] <= 90
          );
        },
        message:
          'Coordinates must be valid [longitude (-180 to 180), latitude (-90 to 90)]',
      },
    },
  },
  { _id: false }
);

const verificationHistorySchema = new Schema(
  {
    status: {
      type: String,
      required: true,
      enum: ['pending', 'verified', 'rejected'],
    },
    reason: {
      type: String,
      trim: true,
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const hospitalSchema = new Schema<IHospital>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Hospital name is required'],
      trim: true,
      maxlength: [200, 'Hospital name cannot exceed 200 characters'],
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
      index: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    coordinates: {
      type: pointSchema,
      default: undefined,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please enter a valid email address',
      ],
    },
    website: {
      type: String,
      trim: true,
    },
    registrationNumber: {
      type: String,
      trim: true,
    },
    licenseNumber: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: {
        values: ['government', 'private', 'nonprofit', 'blood_bank'],
        message: '{VALUE} is not a valid hospital type',
      },
      default: 'private',
      required: true,
    },
    verificationStatus: {
      type: String,
      enum: {
        values: ['pending', 'verified', 'rejected'],
        message: '{VALUE} is not a valid verification status',
      },
      default: 'pending',
      required: true,
      index: true,
    },
    verificationHistory: {
      type: [verificationHistorySchema],
      default: [],
    },
    operatingHours: {
      type: String,
      trim: true,
    },
    emergencyContact: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
hospitalSchema.index({ userId: 1 }, { unique: true });
hospitalSchema.index({ verificationStatus: 1 });
hospitalSchema.index({ city: 1 });
hospitalSchema.index({ coordinates: '2dsphere' }, { sparse: true });
hospitalSchema.index({ verificationStatus: 1, city: 1 });

export const Hospital: Model<IHospital> =
  mongoose.models.Hospital ||
  mongoose.model<IHospital>('Hospital', hospitalSchema);

export default Hospital;
