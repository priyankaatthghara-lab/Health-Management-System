import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IConsentRecord extends Document {
  userId: mongoose.Types.ObjectId;
  purpose:
    | 'contact_sharing'
    | 'location_sharing'
    | 'health_info_sharing'
    | 'data_processing'
    | 'marketing';
  version: string;
  granted: boolean;
  grantedAt?: Date;
  revokedAt?: Date;
  ipAddress?: string;
  createdAt: Date;
}

const consentRecordSchema = new Schema<IConsentRecord>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    purpose: {
      type: String,
      enum: {
        values: [
          'contact_sharing',
          'location_sharing',
          'health_info_sharing',
          'data_processing',
          'marketing',
        ],
        message: '{VALUE} is not a valid consent purpose',
      },
      required: [true, 'Consent purpose is required'],
    },
    version: {
      type: String,
      required: [true, 'Consent version is required'],
      default: '1.0',
      trim: true,
    },
    granted: {
      type: Boolean,
      required: true,
      default: true,
    },
    grantedAt: {
      type: Date,
      default: Date.now,
    },
    revokedAt: {
      type: Date,
      default: undefined,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: false },
  }
);

// Indexes
consentRecordSchema.index({ userId: 1, purpose: 1 });
consentRecordSchema.index({ userId: 1 });
consentRecordSchema.index({ purpose: 1 });

export const ConsentRecord: Model<IConsentRecord> =
  mongoose.models.ConsentRecord ||
  mongoose.model<IConsentRecord>('ConsentRecord', consentRecordSchema);

export default ConsentRecord;
