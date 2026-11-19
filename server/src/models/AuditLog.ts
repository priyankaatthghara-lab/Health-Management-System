import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAuditLog extends Document {
  actorId?: mongoose.Types.ObjectId;
  actorRole?: string;
  action: string;
  targetType:
    | 'user'
    | 'donor_profile'
    | 'hospital'
    | 'blood_request'
    | 'donor_match'
    | 'donation_record'
    | 'notification'
    | 'system';
  targetId?: mongoose.Types.ObjectId;
  metadata?: Record<string, any>;
  ipAddress?: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    actorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: undefined,
      index: true,
    },
    actorRole: {
      type: String,
      trim: true,
    },
    action: {
      type: String,
      required: [true, 'Audit action is required'],
      trim: true,
      index: true,
    },
    targetType: {
      type: String,
      enum: {
        values: [
          'user',
          'donor_profile',
          'hospital',
          'blood_request',
          'donor_match',
          'donation_record',
          'notification',
          'system',
        ],
        message: '{VALUE} is not a valid audit target type',
      },
      required: [true, 'Target type is required'],
      index: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      default: undefined,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: () => ({}),
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
auditLogSchema.index({ actorId: 1, action: 1, targetType: 1, createdAt: -1 });
auditLogSchema.index({ targetType: 1, targetId: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ actorId: 1 });
auditLogSchema.index({ targetType: 1 });

// TTL index for auto-cleanup after 90 days (90 * 24 * 60 * 60 = 7,776,000 seconds)
auditLogSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60 }
);

export const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog ||
  mongoose.model<IAuditLog>('AuditLog', auditLogSchema);

export default AuditLog;
