/**
 * LifeLink AI TypeScript Data Types & Interfaces
 */

export type UserRole = 'donor' | 'hospital' | 'admin';

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type BloodComponent = 'red_blood_cells' | 'platelets' | 'plasma' | 'whole_blood';

export type Urgency = 'routine' | 'urgent' | 'emergency';

export type RequestStatus =
  | 'draft'
  | 'submitted'
  | 'pending_review'
  | 'active'
  | 'donor_contacted'
  | 'coordination_in_progress'
  | 'fulfilled'
  | 'cancelled';

export type MatchStatus =
  | 'identified'
  | 'contacted'
  | 'awaiting_response'
  | 'accepted'
  | 'declined'
  | 'not_reachable'
  | 'expired';

export type DonorAvailability = 'available' | 'temporarily_unavailable' | 'unavailable';

export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export type ContactPreference = 'email' | 'phone' | 'sms' | 'whatsapp';

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface DonorProfile {
  id?: string;
  userId: string;
  user?: User;
  dob: string;
  bloodGroup: BloodGroup;
  bloodGroupVerified: boolean;
  city: string;
  state: string;
  pincode?: string;
  address?: string;
  coordinates: Coordinates;
  availability: DonorAvailability;
  lastDonation?: string | null;
  contactPreference: ContactPreference;
  medicalClearance?: boolean;
  totalDonations?: number;
  weightKg?: number;
  gender?: 'male' | 'female' | 'other';
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface HospitalContact {
  phone: string;
  emergencyPhone?: string;
  email: string;
  contactPerson?: string;
}

export interface Hospital {
  id: string;
  _id?: string;
  userId: string;
  user?: User;
  name: string;
  registrationNumber?: string;
  licenseNumber?: string;
  address: string;
  city: string;
  state: string;
  pincode?: string;
  coordinates: Coordinates;
  contact: HospitalContact;
  verificationStatus: VerificationStatus;
  verificationNotes?: string;
  verifiedAt?: string;
  bloodBankLicense?: string;
  bedCapacity?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface RequestTimelineEvent {
  status: RequestStatus;
  timestamp: string;
  note?: string;
  actorId?: string;
  actorName?: string;
}

export interface BloodRequestLocation {
  hospitalName?: string;
  address: string;
  city: string;
  state?: string;
  coordinates: Coordinates;
}

export interface BloodRequest {
  id: string;
  _id?: string;
  hospitalId: string;
  hospital?: Hospital;
  patientRef: string;
  bloodGroup: BloodGroup;
  component: BloodComponent;
  units: number;
  urgency: Urgency;
  requiredBy: string;
  location: BloodRequestLocation;
  notes?: string;
  status: RequestStatus;
  timeline: RequestTimelineEvent[];
  matchesCount?: number;
  fulfilledUnits?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface RankingFactors {
  distanceScore: number;
  recencyScore: number;
  availabilityScore: number;
  responsivenessScore: number;
  compatibilityScore: number;
}

export interface ContactAttempt {
  timestamp: string;
  channel: 'sms' | 'phone' | 'email' | 'whatsapp' | 'push';
  outcome: 'sent' | 'delivered' | 'answered' | 'no_answer' | 'failed';
  notes?: string;
}

export interface DonorResponseDetails {
  respondedAt?: string;
  decision?: 'accepted' | 'declined';
  reason?: string;
  estimatedArrival?: string;
}

export interface CompatibilityResult {
  compatible: boolean;
  reason?: string;
  isExactMatch: boolean;
  preliminaryNotice: string;
}

export interface DonorMatch {
  id: string;
  _id?: string;
  requestId: string;
  request?: BloodRequest;
  donorId: string;
  donor?: DonorProfile;
  donorUser?: User;
  compatibilityResult: CompatibilityResult;
  distance: number; // in kilometers
  rankingScore: number; // normalized ranking score
  rankingFactors: RankingFactors;
  explanation: string;
  status: MatchStatus;
  contactHistory: ContactAttempt[];
  donorResponse?: DonorResponseDetails;
  createdAt: string;
  updatedAt?: string;
}

export type NotificationType =
  | 'emergency_request'
  | 'match_found'
  | 'request_update'
  | 'donor_response'
  | 'verification_status'
  | 'system_alert'
  | 'donation_reminder';

export interface Notification {
  id: string;
  _id?: string;
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedRequest?: string | BloodRequest;
  relatedMatchId?: string;
  read: boolean;
  createdAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T = unknown> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
}

export interface AuthResponse {
  token: string;
  user: User;
  profile?: DonorProfile | Hospital;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterDonorPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  dob: string;
  bloodGroup: BloodGroup;
  city: string;
  state: string;
  coordinates: Coordinates;
  contactPreference?: ContactPreference;
}

export interface RegisterHospitalPayload {
  name: string;
  email: string;
  password: string;
  hospitalName: string;
  registrationNumber?: string;
  phone: string;
  emergencyPhone?: string;
  address: string;
  city: string;
  state: string;
  coordinates: Coordinates;
}
