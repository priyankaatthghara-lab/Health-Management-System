import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IDonationRecord extends Document {
  donorId: mongoose.Types.ObjectId;
  hospitalId?: mongoose.Types.ObjectId;
  requestId?: mongoose.Types.ObjectId;
  donationDate: Date;
  bloodGroup: string;
  component: string;
  units: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  verifiedBy?: mongoose.Types.ObjectId;
  verificationDate?: Date;
  notes?: string;
  certificate?: {
    issued: boolean;
    issuedAt?: Date;
    certificateId?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const certificateSchema = new Schema(
  {
    issued: {
      type: Boolean,
      default: false,
    },
    issuedAt: {
      type: Date,
    },
    certificateId: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const donationRecordSchema = new Schema<IDonationRecord>(
  {
    donorId: {
      type: Schema.Types.ObjectId,
      ref: 'DonorProfile',
      required: [true, 'Donor profile ID is required'],
      index: true,
    },
    hospitalId: {
      type: Schema.Types.ObjectId,
      ref: 'Hospital',
      index: true,
    },
    requestId: {
      type: Schema.Types.ObjectId,
      ref: 'BloodRequest',
    },
    donationDate: {
      type: Date,
      required: [true, 'Donation date is required'],
      default: Date.now,
      index: true,
    },
    bloodGroup: {
      type: String,
      required: [true, 'Blood group is required'],
      trim: true,
    },
    component: {
      type: String,
      required: [true, 'Blood component is required'],
      trim: true,
      default: 'whole_blood',
    },
    units: {
      type: Number,
      required: [true, 'Units donated is required'],
      min: [1, 'At least 1 unit must be donated'],
      default: 1,
    },
    status: {
      type: String,
      enum: {
        values: ['scheduled', 'completed', 'cancelled', 'no_show'],
        message: '{VALUE} is not a valid donation status',
      },
      default: 'scheduled',
      required: true,
      index: true,
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    verificationDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
    certificate: {
      type: certificateSchema,
      default: () => ({ issued: false }),
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
donationRecordSchema.index({ donorId: 1 });
donationRecordSchema.index({ hospitalId: 1 });
donationRecordSchema.index({ donationDate: -1 });
donationRecordSchema.index({ donorId: 1, donationDate: -1 });
donationRecordSchema.index({ status: 1 });
donationRecordSchema.index({ donorId: 1, status: 1 });

export const DonationRecord: Model<IDonationRecord> =
  mongoose.models.DonationRecord ||
  mongoose.model<IDonationRecord>('DonationRecord', donationRecordSchema);

export default DonationRecord;
