import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { config } from '../src/config';
import { connectDB, disconnectDB } from '../src/config/database';
import { User, IUser } from '../src/models/User';
import { DonorProfile, IDonorProfile } from '../src/models/DonorProfile';
import { Hospital, IHospital } from '../src/models/Hospital';
import { BloodRequest, IBloodRequest } from '../src/models/BloodRequest';
import { DonorMatch, IDonorMatch } from '../src/models/DonorMatch';
import { Notification, INotification } from '../src/models/Notification';
import { AuditLog } from '../src/models/AuditLog';

// Standard demo account password
const DEMO_PASSWORD = 'Demo123!';

/**
 * Realistic Indian City Coordinates [longitude, latitude]
 */
const CITY_COORDINATES = {
  Mumbai: [72.8777, 19.076] as [number, number],
  Delhi: [77.1025, 28.7041] as [number, number],
  Bangalore: [77.5946, 12.9716] as [number, number],
  Chennai: [80.2707, 13.0827] as [number, number],
  Hyderabad: [78.4867, 17.385] as [number, number],
  Pune: [73.8567, 18.5204] as [number, number],
  Kolkata: [88.3639, 22.5726] as [number, number],
  Jaipur: [75.7873, 26.9124] as [number, number],
};

/**
 * 8 Synthetic Demo Donors specification
 */
const DEMO_DONORS = [
  {
    email: 'donor1@demo.lifelink.ai',
    name: 'Aarav Sharma [DEMO]',
    phone: '+91 98201 11001',
    dateOfBirth: new Date('1994-05-14'),
    city: 'Mumbai',
    state: 'Maharashtra',
    bloodGroup: 'O+' as const,
    coordinates: CITY_COORDINATES.Mumbai,
    availability: 'available' as const,
    contactPreference: 'both' as const,
    weight: 72,
  },
  {
    email: 'donor2@demo.lifelink.ai',
    name: 'Rohan Gupta [DEMO]',
    phone: '+91 98112 22002',
    dateOfBirth: new Date('1991-08-22'),
    city: 'Delhi',
    state: 'Delhi',
    bloodGroup: 'A+' as const,
    coordinates: CITY_COORDINATES.Delhi,
    availability: 'available' as const,
    contactPreference: 'phone' as const,
    weight: 68,
  },
  {
    email: 'donor3@demo.lifelink.ai',
    name: 'Priya Nair [DEMO]',
    phone: '+91 98453 33003',
    dateOfBirth: new Date('1996-11-03'),
    city: 'Bangalore',
    state: 'Karnataka',
    bloodGroup: 'B+' as const,
    coordinates: CITY_COORDINATES.Bangalore,
    availability: 'available' as const,
    contactPreference: 'email' as const,
    weight: 58,
  },
  {
    email: 'donor4@demo.lifelink.ai',
    name: 'Karthik Subramanian [DEMO]',
    phone: '+91 98404 44004',
    dateOfBirth: new Date('1989-03-19'),
    city: 'Chennai',
    state: 'Tamil Nadu',
    bloodGroup: 'AB+' as const,
    coordinates: CITY_COORDINATES.Chennai,
    availability: 'temporarily_unavailable' as const,
    contactPreference: 'both' as const,
    weight: 80,
  },
  {
    email: 'donor5@demo.lifelink.ai',
    name: 'Ananya Reddy [DEMO]',
    phone: '+91 98495 55005',
    dateOfBirth: new Date('1998-07-28'),
    city: 'Hyderabad',
    state: 'Telangana',
    bloodGroup: 'O-' as const,
    coordinates: CITY_COORDINATES.Hyderabad,
    availability: 'available' as const,
    contactPreference: 'phone' as const,
    weight: 62,
  },
  {
    email: 'donor6@demo.lifelink.ai',
    name: 'Vikram Joshi [DEMO]',
    phone: '+91 98226 66006',
    dateOfBirth: new Date('1992-12-10'),
    city: 'Pune',
    state: 'Maharashtra',
    bloodGroup: 'A-' as const,
    coordinates: CITY_COORDINATES.Pune,
    availability: 'available' as const,
    contactPreference: 'both' as const,
    weight: 75,
  },
  {
    email: 'donor7@demo.lifelink.ai',
    name: 'Debasish Banerjee [DEMO]',
    phone: '+91 98307 77007',
    dateOfBirth: new Date('1987-02-15'),
    city: 'Kolkata',
    state: 'West Bengal',
    bloodGroup: 'B-' as const,
    coordinates: CITY_COORDINATES.Kolkata,
    availability: 'unavailable' as const,
    contactPreference: 'email' as const,
    weight: 66,
  },
  {
    email: 'donor8@demo.lifelink.ai',
    name: 'Meera Shekhawat [DEMO]',
    phone: '+91 98298 88008',
    dateOfBirth: new Date('1997-09-09'),
    city: 'Jaipur',
    state: 'Rajasthan',
    bloodGroup: 'AB-' as const,
    coordinates: CITY_COORDINATES.Jaipur,
    availability: 'available' as const,
    contactPreference: 'both' as const,
    weight: 55,
  },
];

/**
 * 3 Synthetic Demo Hospitals specification
 */
const DEMO_HOSPITALS = [
  {
    email: 'hospital1@demo.lifelink.ai',
    adminName: 'Dr. Rajesh Mehta [DEMO]',
    hospitalName: 'Apollo Multispeciality Hospital [DEMO]',
    address: 'Plot No. 1, Gandhinagar, Bandra East',
    city: 'Mumbai',
    state: 'Maharashtra',
    coordinates: CITY_COORDINATES.Mumbai,
    phone: '+91 22 2650 9000',
    type: 'private' as const,
    registrationNumber: 'MH-MUM-2023-8821',
    licenseNumber: 'BL-MH-9941',
    verificationStatus: 'verified' as const,
    verificationReason: 'Verified by State Blood Transfusion Council Maharashtra',
    operatingHours: '24/7 Emergency & Blood Bank',
    emergencyContact: '+91 22 2650 9999',
  },
  {
    email: 'hospital2@demo.lifelink.ai',
    adminName: 'Dr. Sunita Rao [DEMO]',
    hospitalName: 'All India Institute of Medical Sciences [DEMO]',
    address: 'Ansari Nagar, Ring Road',
    city: 'Delhi',
    state: 'Delhi',
    coordinates: CITY_COORDINATES.Delhi,
    phone: '+91 11 2658 8500',
    type: 'government' as const,
    registrationNumber: 'DL-DEL-2022-1049',
    licenseNumber: 'BL-DL-3382',
    verificationStatus: 'pending' as const,
    verificationReason: 'Government hospital registration submitted, awaiting clinical documents',
    operatingHours: '24/7 Inpatient and Trauma Care',
    emergencyContact: '+91 11 2658 8999',
  },
  {
    email: 'hospital3@demo.lifelink.ai',
    adminName: 'Dr. Vikram Sen [DEMO]',
    hospitalName: 'City Care Blood Bank & Diagnostic Centre [DEMO]',
    address: '45 Residency Road, Ashok Nagar',
    city: 'Bangalore',
    state: 'Karnataka',
    coordinates: CITY_COORDINATES.Bangalore,
    phone: '+91 80 4120 7000',
    type: 'blood_bank' as const,
    registrationNumber: 'KA-BLR-2021-0021',
    licenseNumber: 'BL-KA-0012-REV',
    verificationStatus: 'rejected' as const,
    verificationReason: 'Renewal license lapsed, inspection pending state authorization',
    operatingHours: '08:00 - 20:00 Daily',
    emergencyContact: '+91 80 4120 7999',
  },
];

async function seedDatabase(): Promise<void> {
  console.log('====================================================');
  console.log('       LifeLink AI Database Seeding Routine         ');
  console.log('====================================================\n');

  try {
    await connectDB();
    console.log('[Seed] Database connection established successfully.\n');

    const summary = {
      adminCreated: 0,
      adminSkipped: 0,
      donorsCreated: 0,
      donorsSkipped: 0,
      hospitalsCreated: 0,
      hospitalsSkipped: 0,
      bloodRequestsCreated: 0,
      donorMatchesCreated: 0,
      notificationsCreated: 0,
    };

    // ----------------------------------------------------
    // 1. Seed System Administrator
    // ----------------------------------------------------
    console.log('[Seed] 1. Checking System Administrator account...');
    let adminUser = await User.findOne({ email: config.adminEmail.toLowerCase() });

    if (!adminUser) {
      adminUser = await User.create({
        name: config.adminName,
        email: config.adminEmail.toLowerCase(),
        password: config.adminPassword, // Pre-save hook hashes with bcrypt
        role: 'admin',
        status: 'active',
        emailVerified: true,
      });

      await AuditLog.create({
        actorId: adminUser._id,
        actorRole: 'admin',
        action: 'SEED_ADMIN_CREATED',
        targetType: 'user',
        targetId: adminUser._id,
        metadata: { email: adminUser.email },
      });

      console.log(`[Seed]  Created Admin: ${adminUser.email}`);
      summary.adminCreated++;
    } else {
      console.log(`[Seed]  Admin already exists: ${adminUser.email} (skipping)`);
      summary.adminSkipped++;
    }

    // ----------------------------------------------------
    // 2. Seed 8 Synthetic Donors
    // ----------------------------------------------------
    console.log('\n[Seed] 2. Seeding 8 Synthetic Donors across Indian metro hubs...');
    const createdDonorProfiles: IDonorProfile[] = [];

    for (const donorData of DEMO_DONORS) {
      let user = await User.findOne({ email: donorData.email });

      if (!user) {
        user = await User.create({
          name: donorData.name,
          email: donorData.email,
          password: DEMO_PASSWORD, // Pre-save hook hashes with bcrypt
          role: 'donor',
          status: 'active',
          emailVerified: true,
        });

        const donorProfile = await DonorProfile.create({
          userId: user._id,
          phone: donorData.phone,
          dateOfBirth: donorData.dateOfBirth,
          bloodGroup: donorData.bloodGroup,
          bloodGroupVerified: true,
          city: donorData.city,
          state: donorData.state,
          coordinates: {
            type: 'Point',
            coordinates: donorData.coordinates,
          },
          availability: donorData.availability,
          contactPreference: donorData.contactPreference,
          consentToContact: true,
          consentToLocationSharing: true,
          donationCount: Math.floor(Math.random() * 5) + 1,
          healthInfo: {
            weight: donorData.weight,
            hasChronicConditions: false,
            conditions: [],
            medications: [],
            lastUpdated: new Date(),
          },
        });

        createdDonorProfiles.push(donorProfile);
        summary.donorsCreated++;
        console.log(`[Seed]  Created Donor: ${donorData.name} (${donorData.bloodGroup}, ${donorData.city})`);
      } else {
        const existingProfile = await DonorProfile.findOne({ userId: user._id });
        if (existingProfile) {
          createdDonorProfiles.push(existingProfile);
        }
        summary.donorsSkipped++;
        console.log(`[Seed]  Donor already exists: ${donorData.email} (skipping)`);
      }
    }

    // ----------------------------------------------------
    // 3. Seed 3 Synthetic Hospitals
    // ----------------------------------------------------
    console.log('\n[Seed] 3. Seeding 3 Synthetic Hospitals (verified, pending, rejected)...');
    const createdHospitals: IHospital[] = [];

    for (const hospData of DEMO_HOSPITALS) {
      let user = await User.findOne({ email: hospData.email });

      if (!user) {
        user = await User.create({
          name: hospData.adminName,
          email: hospData.email,
          password: DEMO_PASSWORD,
          role: 'hospital',
          status: 'active',
          emailVerified: true,
        });

        const hospital = await Hospital.create({
          userId: user._id,
          name: hospData.hospitalName,
          address: hospData.address,
          city: hospData.city,
          state: hospData.state,
          coordinates: {
            type: 'Point',
            coordinates: hospData.coordinates,
          },
          phone: hospData.phone,
          email: hospData.email,
          type: hospData.type,
          registrationNumber: hospData.registrationNumber,
          licenseNumber: hospData.licenseNumber,
          verificationStatus: hospData.verificationStatus,
          verificationHistory: [
            {
              status: hospData.verificationStatus,
              reason: hospData.verificationReason,
              timestamp: new Date(),
            },
          ],
          operatingHours: hospData.operatingHours,
          emergencyContact: hospData.emergencyContact,
        });

        createdHospitals.push(hospital);
        summary.hospitalsCreated++;
        console.log(
          `[Seed]  Created Hospital: ${hospData.hospitalName} [${hospData.verificationStatus.toUpperCase()}]`
        );
      } else {
        const existingHospital = await Hospital.findOne({ userId: user._id });
        if (existingHospital) {
          createdHospitals.push(existingHospital);
        }
        summary.hospitalsSkipped++;
        console.log(`[Seed]  Hospital already exists: ${hospData.email} (skipping)`);
      }
    }

    // ----------------------------------------------------
    // 4. Seed 5 Synthetic Blood Requests
    // ----------------------------------------------------
    console.log('\n[Seed] 4. Seeding 5 Synthetic Blood Requests with varied urgency...');
    const createdRequests: IBloodRequest[] = [];

    const verifiedHospital =
      createdHospitals.find((h) => h.verificationStatus === 'verified') || createdHospitals[0];
    const pendingHospital =
      createdHospitals.find((h) => h.verificationStatus === 'pending') || createdHospitals[1] || verifiedHospital;

    if (verifiedHospital && pendingHospital) {
      const bloodRequestSpecs = [
        {
          hospitalId: verifiedHospital._id,
          patientRef: 'PAT-MUM-9012 [DEMO]',
          bloodGroup: 'O-' as const,
          component: 'whole_blood' as const,
          unitsRequired: 3,
          unitsFulfilled: 0,
          urgency: 'emergency' as const,
          requiredBy: new Date(Date.now() + 4 * 60 * 60 * 1000), // in 4 hours
          location: {
            address: verifiedHospital.address,
            city: verifiedHospital.city,
            state: verifiedHospital.state,
            coordinates: verifiedHospital.coordinates,
          },
          notes: '[DEMO] Critical polytrauma resuscitation in progress in Emergency OT 2.',
          contactPerson: 'Dr. Rajesh Mehta',
          contactPhone: verifiedHospital.phone,
          status: 'active' as const,
        },
        {
          hospitalId: verifiedHospital._id,
          patientRef: 'PAT-MUM-8841 [DEMO]',
          bloodGroup: 'A+' as const,
          component: 'red_blood_cells' as const,
          unitsRequired: 2,
          unitsFulfilled: 1,
          urgency: 'urgent' as const,
          requiredBy: new Date(Date.now() + 24 * 60 * 60 * 1000), // in 24 hours
          location: {
            address: verifiedHospital.address,
            city: verifiedHospital.city,
            state: verifiedHospital.state,
            coordinates: verifiedHospital.coordinates,
          },
          notes: '[DEMO] Pre-operative reservation for coronary artery bypass graft (CABG).',
          contactPerson: 'Dr. Rajesh Mehta',
          contactPhone: verifiedHospital.phone,
          status: 'donor_contacted' as const,
        },
        {
          hospitalId: pendingHospital._id,
          patientRef: 'PAT-DEL-4419 [DEMO]',
          bloodGroup: 'B+' as const,
          component: 'platelets' as const,
          unitsRequired: 4,
          unitsFulfilled: 2,
          urgency: 'urgent' as const,
          requiredBy: new Date(Date.now() + 36 * 60 * 60 * 1000), // in 36 hours
          location: {
            address: pendingHospital.address,
            city: pendingHospital.city,
            state: pendingHospital.state,
            coordinates: pendingHospital.coordinates,
          },
          notes: '[DEMO] Pediatric oncology patient undergoing post-chemotherapy nadir support.',
          contactPerson: 'Dr. Sunita Rao',
          contactPhone: pendingHospital.phone,
          status: 'coordination_in_progress' as const,
        },
        {
          hospitalId: pendingHospital._id,
          patientRef: 'PAT-DEL-3312 [DEMO]',
          bloodGroup: 'AB-' as const,
          component: 'plasma' as const,
          unitsRequired: 2,
          unitsFulfilled: 2,
          urgency: 'routine' as const,
          requiredBy: new Date(Date.now() + 48 * 60 * 60 * 1000), // in 48 hours
          location: {
            address: pendingHospital.address,
            city: pendingHospital.city,
            state: pendingHospital.state,
            coordinates: pendingHospital.coordinates,
          },
          notes: '[DEMO] Burn ICU reconstructive graft plasma transfusion support.',
          contactPerson: 'Dr. Sunita Rao',
          contactPhone: pendingHospital.phone,
          status: 'fulfilled' as const,
        },
        {
          hospitalId: verifiedHospital._id,
          patientRef: 'PAT-MUM-7732 [DEMO]',
          bloodGroup: 'O+' as const,
          component: 'whole_blood' as const,
          unitsRequired: 1,
          unitsFulfilled: 0,
          urgency: 'routine' as const,
          requiredBy: new Date(Date.now() + 72 * 60 * 60 * 1000), // in 72 hours
          location: {
            address: verifiedHospital.address,
            city: verifiedHospital.city,
            state: verifiedHospital.state,
            coordinates: verifiedHospital.coordinates,
          },
          notes: '[DEMO] Planned orthopedic total knee arthroplasty reservation.',
          contactPerson: 'Dr. Rajesh Mehta',
          contactPhone: verifiedHospital.phone,
          status: 'submitted' as const,
        },
      ];

      for (const reqSpec of bloodRequestSpecs) {
        const existing = await BloodRequest.findOne({
          hospitalId: reqSpec.hospitalId,
          patientRef: reqSpec.patientRef,
        });

        if (!existing) {
          const reqDoc = await BloodRequest.create(reqSpec);
          createdRequests.push(reqDoc);
          summary.bloodRequestsCreated++;
          console.log(
            `[Seed]  Created Blood Request: ${reqSpec.patientRef} (${reqSpec.bloodGroup}, ${reqSpec.urgency.toUpperCase()})`
          );
        } else {
          createdRequests.push(existing);
        }
      }
    }

    // ----------------------------------------------------
    // 5. Seed Sample Donor Matches
    // ----------------------------------------------------
    console.log('\n[Seed] 5. Seeding Algorithmic Donor Matches with Clinical Disclaimers...');

    if (createdRequests.length > 0 && createdDonorProfiles.length > 0) {
      // Find matching donor profiles for demo matches
      const oMinusDonor = createdDonorProfiles.find((d) => d.bloodGroup === 'O-') || createdDonorProfiles[4];
      const aPlusDonor = createdDonorProfiles.find((d) => d.bloodGroup === 'A+') || createdDonorProfiles[1];
      const emergencyRequest = createdRequests.find((r) => r.urgency === 'emergency') || createdRequests[0];
      const urgentRequest = createdRequests.find((r) => r.urgency === 'urgent') || createdRequests[1];

      const matchSpecs = [
        {
          requestId: emergencyRequest._id,
          donorId: oMinusDonor._id,
          compatibilityResult: {
            isCompatible: true,
            compatibilityType: 'exact' as const,
            component: 'whole_blood',
            note: 'Preliminary algorithmic match: Universal donor group O- is compatible for emergency transfusion. Clinical crossmatch required before administration.',
          },
          distance: {
            straightLine: 620.5,
            unit: 'km' as const,
            calculationMethod: 'haversine' as const,
          },
          rankingScore: 92.4,
          rankingFactors: {
            bloodGroupScore: 100,
            distanceScore: 65,
            availabilityScore: 95,
            urgencyMultiplier: 1.5,
            completenessScore: 90,
          },
          explanation: [
            'Exact O- negative blood group compatibility',
            'High responsiveness score from previous donor engagements',
            'Available immediately without recent donation cooldown',
          ],
          status: 'contacted' as const,
          contactHistory: [
            {
              method: 'SMS & In-App Notification',
              timestamp: new Date(),
              note: 'High priority alert dispatched for emergency need',
            },
          ],
          professionalReviewStatus: 'approved' as const,
        },
        {
          requestId: urgentRequest._id,
          donorId: aPlusDonor._id,
          compatibilityResult: {
            isCompatible: true,
            compatibilityType: 'exact' as const,
            component: 'red_blood_cells',
            note: 'Preliminary algorithmic match: Exact A+ group match. Clinical verification mandatory.',
          },
          distance: {
            straightLine: 12.8,
            unit: 'km' as const,
            calculationMethod: 'haversine' as const,
          },
          rankingScore: 96.8,
          rankingFactors: {
            bloodGroupScore: 100,
            distanceScore: 98,
            availabilityScore: 90,
            urgencyMultiplier: 1.2,
            completenessScore: 95,
          },
          explanation: [
            'Exact blood group match (A+ to A+)',
            'Close geographic proximity (within 15 km)',
            'Healthy profile completeness and verified donation record',
          ],
          status: 'identified' as const,
          contactHistory: [],
          professionalReviewStatus: 'pending' as const,
        },
      ];

      for (const mSpec of matchSpecs) {
        const existing = await DonorMatch.findOne({
          requestId: mSpec.requestId,
          donorId: mSpec.donorId,
        });

        if (!existing) {
          await DonorMatch.create(mSpec);
          summary.donorMatchesCreated++;
          console.log(
            `[Seed]  Created Match: Request ${mSpec.requestId} -> Donor ${mSpec.donorId} [Score: ${mSpec.rankingScore}]`
          );
        }
      }
    }

    // ----------------------------------------------------
    // 6. Seed Sample Notifications
    // ----------------------------------------------------
    console.log('\n[Seed] 6. Seeding User Notifications...');

    const sampleUsers = await User.find({ role: { $in: ['donor', 'hospital'] } }).limit(5);

    if (sampleUsers.length > 0) {
      const notificationSpecs = [
        {
          recipientId: sampleUsers[0]._id,
          type: 'blood_request' as const,
          title: '[DEMO] Emergency Blood Request in Your Area',
          message:
            'A hospital in your metropolitan region requires urgent blood donation. Please verify your availability.',
          read: false,
        },
        {
          recipientId: sampleUsers[0]._id,
          type: 'donation_reminder' as const,
          title: '[DEMO] Eligibility Cycle Active',
          message:
            'You have completed the standard waiting period since your last donation and are now eligible to save lives again.',
          read: true,
          readAt: new Date(),
        },
      ];

      if (sampleUsers.length > 1) {
        notificationSpecs.push({
          recipientId: sampleUsers[1]._id,
          type: 'match_found' as const,
          title: '[DEMO] Compatible Donor Identified',
          message:
            'An algorithmic match with a compatibility rating of 96.8% was identified for your active requisition.',
          read: false,
        });
      }

      for (const notifSpec of notificationSpecs) {
        const existing = await Notification.findOne({
          recipientId: notifSpec.recipientId,
          title: notifSpec.title,
        });

        if (!existing) {
          await Notification.create(notifSpec);
          summary.notificationsCreated++;
          console.log(`[Seed]  Created Notification: "${notifSpec.title}"`);
        }
      }
    }

    // ----------------------------------------------------
    // Summary Output
    // ----------------------------------------------------
    console.log('\n====================================================');
    console.log('              SEEDING SUMMARY REPORT                ');
    console.log('====================================================');
    console.log(`Admin Account:        ${summary.adminCreated} created, ${summary.adminSkipped} skipped`);
    console.log(`Donors (8 Indian):    ${summary.donorsCreated} created, ${summary.donorsSkipped} skipped`);
    console.log(`Hospitals (3 types):  ${summary.hospitalsCreated} created, ${summary.hospitalsSkipped} skipped`);
    console.log(`Blood Requests (5):   ${summary.bloodRequestsCreated} created`);
    console.log(`Donor Matches:        ${summary.donorMatchesCreated} created`);
    console.log(`Notifications:        ${summary.notificationsCreated} created`);
    console.log('----------------------------------------------------');
    console.log('Demo Credentials:');
    console.log(`  Admin:     ${config.adminEmail} / ${config.adminPassword}`);
    console.log(`  Donors:    donor1@demo.lifelink.ai .. donor8@demo.lifelink.ai / ${DEMO_PASSWORD}`);
    console.log(`  Hospitals: hospital1@demo.lifelink.ai .. hospital3@demo.lifelink.ai / ${DEMO_PASSWORD}`);
    console.log('====================================================\n');
  } catch (error) {
    console.error('[Seed] FATAL: Error executing seed script:', error);
    process.exit(1);
  } finally {
    await disconnectDB();
    console.log('[Seed] Database disconnected cleanly.');
  }
}

// Execute seed function if run directly
if (require.main === module || process.argv[1].endsWith('seed.ts') || process.argv[1].endsWith('seed.js')) {
  seedDatabase()
    .then(() => {
      console.log('[Seed] Completed successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed] Failed:', err);
      process.exit(1);
    });
}

export { seedDatabase };
