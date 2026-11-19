import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IDonorProfile extends Document {
  userId: mongoose.Types.ObjectId;
  dateOfBirth?: Date;
  bloodGroup?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  bloodGroupVerified: boolean;
  phone?: string;
  city?: string;
  state?: string;
  coordinates?: { type: 'Point'; coordinates: [number, number] }; // [lng, lat]
  availability: 'available' | 'temporarily_unavailable' | 'unavailable';
  availableUntil?: Date;
  lastAvailabilityConfirmation?: Date;
  lastDonationDate?: Date;
  donationCount: number;
  healthInfo?: {
    weight?: number;
    hasChronicConditions?: boolean;
    conditions?: string[];
    medications?: string[];
    lastUpdated?: Date;
  };
  contactPreference: 'email' | 'phone' | 'both';
  consentToContact: boolean;
  consentToLocationSharing: boolean;
  profileCompleteness: number; // 0-100
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

const healthInfoSchema = new Schema(
  {
    weight: {
      type: Number,
      min: [0, 'Weight must be a positive number'],
    },
    hasChronicConditions: {
      type: Boolean,
      default: false,
    },
    conditions: {
      type: [String],
      default: [],
    },
    medications: {
      type: [String],
      default: [],
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const donorProfileSchema = new Schema<IDonorProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
      index: true,
    },
    dateOfBirth: {
      type: Date,
    },
    bloodGroup: {
      type: String,
      enum: {
        values: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        message: '{VALUE} is not a valid blood group',
      },
      index: true,
    },
    bloodGroupVerified: {
      type: Boolean,
      default: false,
    },
    phone: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
      index: true,
    },
    state: {
      type: String,
      trim: true,
    },
    coordinates: {
      type: pointSchema,
      default: undefined,
    },
    availability: {
      type: String,
      enum: {
        values: ['available', 'temporarily_unavailable', 'unavailable'],
        message: '{VALUE} is not a valid availability status',
      },
      default: 'available',
      index: true,
    },
    availableUntil: {
      type: Date,
    },
    lastAvailabilityConfirmation: {
      type: Date,
      default: Date.now,
    },
    lastDonationDate: {
      type: Date,
    },
    donationCount: {
      type: Number,
      default: 0,
      min: [0, 'Donation count cannot be negative'],
    },
    healthInfo: {
      type: healthInfoSchema,
      default: () => ({}),
    },
    contactPreference: {
      type: String,
      enum: {
        values: ['email', 'phone', 'both'],
        message: '{VALUE} is not a valid contact preference',
      },
      default: 'both',
    },
    consentToContact: {
      type: Boolean,
      default: true,
    },
    consentToLocationSharing: {
      type: Boolean,
      default: false,
    },
    profileCompleteness: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
donorProfileSchema.index({ userId: 1 }, { unique: true });
donorProfileSchema.index({ bloodGroup: 1 });
donorProfileSchema.index({ availability: 1 });
donorProfileSchema.index({ city: 1 });
donorProfileSchema.index({ coordinates: '2dsphere' }, { sparse: true });
donorProfileSchema.index({ bloodGroup: 1, availability: 1 });
donorProfileSchema.index({ city: 1, bloodGroup: 1 });

// Pre-save hook to calculate profile completeness (0 - 100)
donorProfileSchema.pre<IDonorProfile>('save', function (next) {
  let score = 0;

  // Key matching criteria
  if (this.bloodGroup) score += 15;
  if (this.phone && this.phone.trim().length > 0) score += 10;
  if (this.city && this.city.trim().length > 0) score += 10;
  if (this.state && this.state.trim().length > 0) score += 5;
  if (
    this.coordinates &&
    Array.isArray(this.coordinates.coordinates) &&
    this.coordinates.coordinates.length === 2 &&
    typeof this.coordinates.coordinates[0] === 'number' &&
    typeof this.coordinates.coordinates[1] === 'number'
  ) {
    score += 10;
  }
  if (this.dateOfBirth) score += 10;
  if (this.availability) score += 10;
  if (
    this.healthInfo &&
    typeof this.healthInfo.weight === 'number' &&
    this.healthInfo.weight > 0
  ) {
    score += 10;
  }
  if (this.contactPreference) score += 10;
  if (this.consentToContact === true) score += 10;

  this.profileCompleteness = Math.min(100, Math.max(0, score));
  next();
});

export const DonorProfile: Model<IDonorProfile> =
  mongoose.models.DonorProfile ||
  mongoose.model<IDonorProfile>('DonorProfile', donorProfileSchema);

export default DonorProfile;
