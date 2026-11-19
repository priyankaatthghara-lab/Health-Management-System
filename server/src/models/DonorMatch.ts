import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IDonorMatch extends Document {
  requestId: mongoose.Types.ObjectId;
  donorId: mongoose.Types.ObjectId;
  compatibilityResult: {
    isCompatible: boolean;
    compatibilityType: 'exact' | 'compatible' | 'incompatible' | 'unknown';
    component: string;
    note: string;
  };
  distance: {
    straightLine: number; // km
    unit: 'km';
    calculationMethod: 'haversine' | 'city_match' | 'unknown';
  };
  rankingScore: number;
  rankingFactors: {
    bloodGroupScore: number;
    distanceScore: number;
    availabilityScore: number;
    urgencyMultiplier: number;
    completenessScore: number;
  };
  explanation: string[];
  status:
    | 'identified'
    | 'contacted'
    | 'awaiting_response'
    | 'accepted'
    | 'declined'
    | 'not_reachable'
    | 'expired';
  contactHistory: Array<{
    method: string;
    timestamp: Date;
    note?: string;
    by?: mongoose.Types.ObjectId;
  }>;
  donorResponse?: {
    response: 'accepted' | 'declined' | 'maybe_later';
    message?: string;
    respondedAt: Date;
  };
  professionalReviewStatus?: 'pending' | 'approved' | 'flagged' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const compatibilityResultSchema = new Schema(
  {
    isCompatible: {
      type: Boolean,
      required: true,
    },
    compatibilityType: {
      type: String,
      enum: {
        values: ['exact', 'compatible', 'incompatible', 'unknown'],
        message: '{VALUE} is not a valid compatibility type',
      },
      required: true,
    },
    component: {
      type: String,
      required: true,
      trim: true,
    },
    note: {
      type: String,
      default:
        'Preliminary algorithmic compatibility assessment; clinical verification required.',
    },
  },
  { _id: false }
);

const distanceSchema = new Schema(
  {
    straightLine: {
      type: Number,
      required: true,
      min: [0, 'Distance cannot be negative'],
    },
    unit: {
      type: String,
      enum: ['km'],
      default: 'km',
    },
    calculationMethod: {
      type: String,
      enum: ['haversine', 'city_match', 'unknown'],
      default: 'haversine',
    },
  },
  { _id: false }
);

const rankingFactorsSchema = new Schema(
  {
    bloodGroupScore: {
      type: Number,
      default: 0,
    },
    distanceScore: {
      type: Number,
      default: 0,
    },
    availabilityScore: {
      type: Number,
      default: 0,
    },
    urgencyMultiplier: {
      type: Number,
      default: 1,
    },
    completenessScore: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const contactHistoryItemSchema = new Schema(
  {
    method: {
      type: String,
      required: true,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      trim: true,
    },
    by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { _id: false }
);

const donorResponseSchema = new Schema(
  {
    response: {
      type: String,
      enum: {
        values: ['accepted', 'declined', 'maybe_later'],
        message: '{VALUE} is not a valid donor response',
      },
      required: true,
    },
    message: {
      type: String,
      trim: true,
    },
    respondedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const donorMatchSchema = new Schema<IDonorMatch>(
  {
    requestId: {
      type: Schema.Types.ObjectId,
      ref: 'BloodRequest',
      required: [true, 'Blood request ID is required'],
      index: true,
    },
    donorId: {
      type: Schema.Types.ObjectId,
      ref: 'DonorProfile',
      required: [true, 'Donor profile ID is required'],
      index: true,
    },
    compatibilityResult: {
      type: compatibilityResultSchema,
      required: true,
    },
    distance: {
      type: distanceSchema,
      required: true,
    },
    rankingScore: {
      type: Number,
      required: true,
      default: 0,
    },
    rankingFactors: {
      type: rankingFactorsSchema,
      default: () => ({}),
    },
    explanation: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: {
        values: [
          'identified',
          'contacted',
          'awaiting_response',
          'accepted',
          'declined',
          'not_reachable',
          'expired',
        ],
        message: '{VALUE} is not a valid donor match status',
      },
      default: 'identified',
      required: true,
      index: true,
    },
    contactHistory: {
      type: [contactHistoryItemSchema],
      default: [],
    },
    donorResponse: {
      type: donorResponseSchema,
      default: undefined,
    },
    professionalReviewStatus: {
      type: String,
      enum: {
        values: ['pending', 'approved', 'flagged', 'rejected'],
        message: '{VALUE} is not a valid professional review status',
      },
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
donorMatchSchema.index({ requestId: 1, donorId: 1 }, { unique: true });
donorMatchSchema.index({ requestId: 1 });
donorMatchSchema.index({ donorId: 1 });
donorMatchSchema.index({ status: 1 });
donorMatchSchema.index({ rankingScore: -1 });
donorMatchSchema.index({ professionalReviewStatus: 1 });
donorMatchSchema.index({ requestId: 1, status: 1 });

export const DonorMatch: Model<IDonorMatch> =
  mongoose.models.DonorMatch ||
  mongoose.model<IDonorMatch>('DonorMatch', donorMatchSchema);

export default DonorMatch;
