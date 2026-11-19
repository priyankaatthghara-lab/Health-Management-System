import mongoose, { Document, Model, Schema } from 'mongoose';

export interface INotification extends Document {
  recipientId: mongoose.Types.ObjectId;
  type:
    | 'blood_request'
    | 'match_found'
    | 'request_update'
    | 'verification'
    | 'donation_reminder'
    | 'system'
    | 'donor_response';
  title: string;
  message: string;
  relatedRequest?: mongoose.Types.ObjectId;
  relatedMatch?: mongoose.Types.ObjectId;
  read: boolean;
  readAt?: Date;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient ID is required'],
      index: true,
    },
    type: {
      type: String,
      enum: {
        values: [
          'blood_request',
          'match_found',
          'request_update',
          'verification',
          'donation_reminder',
          'system',
          'donor_response',
        ],
        message: '{VALUE} is not a valid notification type',
      },
      required: [true, 'Notification type is required'],
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
    },
    relatedRequest: {
      type: Schema.Types.ObjectId,
      ref: 'BloodRequest',
      default: undefined,
    },
    relatedMatch: {
      type: Schema.Types.ObjectId,
      ref: 'DonorMatch',
      default: undefined,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: undefined,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: false },
  }
);

// Indexes
notificationSchema.index({ recipientId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, createdAt: -1 });
notificationSchema.index({ createdAt: -1 });

export const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>('Notification', notificationSchema);

export default Notification;
