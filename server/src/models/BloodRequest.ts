import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IBloodRequest extends Document {
  hospitalId: mongoose.Types.ObjectId;
  patientRef: string; // non-identifying reference
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  component: 'red_blood_cells' | 'platelets' | 'plasma' | 'whole_blood';
  unitsRequired: number;
  unitsFulfilled: number;
  urgency: 'routine' | 'urgent' | 'emergency';
  requiredBy: Date;
  location: {
    address?: string;
    city: string;
    state: string;
    coordinates?: { type: 'Point'; coordinates: [number, number] };
  };
  notes?: string;
  contactPerson: string;
  contactPhone: string;
  status:
    | 'draft'
    | 'submitted'
    | 'pending_review'
    | 'active'
    | 'donor_contacted'
    | 'coordination_in_progress'
    | 'fulfilled'
    | 'cancelled'
    | 'expired';
  cancellationReason?: string;
  timeline: Array<{
    status: string;
    actor?: mongoose.Types.ObjectId;
    note?: string;
    timestamp: Date;
  }>;
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

const timelineItemSchema = new Schema(
  {
    status: {
      type: String,
      required: true,
    },
    actor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    note: {
      type: String,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const bloodRequestSchema = new Schema<IBloodRequest>(
  {
    hospitalId: {
      type: Schema.Types.ObjectId,
      ref: 'Hospital',
      required: [true, 'Hospital ID is required'],
      index: true,
    },
    patientRef: {
      type: String,
      required: [true, 'Non-identifying patient reference is required'],
      trim: true,
      maxlength: [100, 'Patient reference cannot exceed 100 characters'],
    },
    bloodGroup: {
      type: String,
      enum: {
        values: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        message: '{VALUE} is not a valid blood group',
      },
      required: [true, 'Blood group is required'],
      index: true,
    },
    component: {
      type: String,
      enum: {
        values: ['red_blood_cells', 'platelets', 'plasma', 'whole_blood'],
        message: '{VALUE} is not a valid blood component',
      },
      required: [true, 'Blood component is required'],
      default: 'whole_blood',
    },
    unitsRequired: {
      type: Number,
      required: [true, 'Units required is mandatory'],
      min: [1, 'At least 1 unit must be requested'],
      default: 1,
    },
    unitsFulfilled: {
      type: Number,
      required: true,
      min: [0, 'Units fulfilled cannot be negative'],
      default: 0,
    },
    urgency: {
      type: String,
      enum: {
        values: ['routine', 'urgent', 'emergency'],
        message: '{VALUE} is not a valid urgency level',
      },
      required: [true, 'Urgency level is required'],
      default: 'routine',
      index: true,
    },
    requiredBy: {
      type: Date,
      required: [true, 'Required-by date is mandatory'],
      index: true,
    },
    location: {
      address: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
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
    },
    notes: {
      type: String,
      trim: true,
    },
    contactPerson: {
      type: String,
      required: [true, 'Contact person is required'],
      trim: true,
    },
    contactPhone: {
      type: String,
      required: [true, 'Contact phone is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: [
          'draft',
          'submitted',
          'pending_review',
          'active',
          'donor_contacted',
          'coordination_in_progress',
          'fulfilled',
          'cancelled',
          'expired',
        ],
        message: '{VALUE} is not a valid blood request status',
      },
      default: 'submitted',
      required: true,
      index: true,
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
    timeline: {
      type: [timelineItemSchema],
      default: () => [
        {
          status: 'submitted',
          note: 'Blood request submitted',
          timestamp: new Date(),
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
bloodRequestSchema.index({ hospitalId: 1 });
bloodRequestSchema.index({ status: 1 });
bloodRequestSchema.index({ bloodGroup: 1 });
bloodRequestSchema.index({ urgency: 1 });
bloodRequestSchema.index({ requiredBy: 1 });
bloodRequestSchema.index({ 'location.coordinates': '2dsphere' }, { sparse: true });
bloodRequestSchema.index({ status: 1, bloodGroup: 1, urgency: 1 });
bloodRequestSchema.index({ 'location.city': 1, status: 1 });

export const BloodRequest: Model<IBloodRequest> =
  mongoose.models.BloodRequest ||
  mongoose.model<IBloodRequest>('BloodRequest', bloodRequestSchema);

export default BloodRequest;
