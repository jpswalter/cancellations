// file: lib/db/init.ts
import dotenv from 'dotenv';
dotenv.config();
import { initializeFirebaseAdmin } from '../firebase/admin';
const app = initializeFirebaseAdmin();

import { getFirestore } from 'firebase-admin/firestore';
import { collections, CURRENT_SCHEMA_VERSION, Tenant, User } from './schema';
import { getAuth } from 'firebase-admin/auth';
import { v4 as uuidv4 } from 'uuid';

export async function initializeDatabase() {
  try {
    const db = getFirestore(app);
    console.log('Firestore instance obtained');

    // Test connection
    console.log('Testing Firestore connection...');
    const testDoc = await db.collection('test').doc('testDoc').get();
    if (testDoc.exists) {
      console.log('Successfully connected to Firestore');
    } else {
      console.log('Connected to Firestore, but test document does not exist');
    }

    // Initialize test data
    await initializeTestData(db);
  } catch (error) {
    console.error('Error in initializeDatabase:', error);
    throw error;
  }
}

async function initializeTestData(db: FirebaseFirestore.Firestore) {
  const auth = getAuth();
  const currentDate = new Date().toISOString();

  // Create test tenants
  const tenants: Tenant[] = [
    {
      id: uuidv4(),
      name: 'RocketMoney',
      type: 'proxy',
      createdAt: currentDate,
      active: true,
      version: CURRENT_SCHEMA_VERSION,
    },
    {
      id: uuidv4(),
      name: 'BillShark',
      type: 'proxy',
      createdAt: currentDate,
      active: true,
      version: CURRENT_SCHEMA_VERSION,
    },
    {
      id: uuidv4(),
      name: 'ESPN',
      type: 'provider',
      createdAt: currentDate,
      active: true,
      version: CURRENT_SCHEMA_VERSION,
      requiredCustomerInfo: [
        'customerName',
        'customerEmail',
        'accountNumber',
        'lastFourCCDigits',
      ],
    },
    {
      id: uuidv4(),
      name: 'Netflix',
      type: 'provider',
      createdAt: currentDate,
      active: true,
      version: CURRENT_SCHEMA_VERSION,
      requiredCustomerInfo: [
        'customerName',
        'customerEmail',
        'lastFourCCDigits',
      ],
    },
    {
      id: uuidv4(),
      name: 'Demo Corp',
      type: 'provider',
      createdAt: currentDate,
      active: true,
      version: CURRENT_SCHEMA_VERSION,
      requiredCustomerInfo: [
        'customerName',
        'customerEmail',
        'accountNumber',
        'lastFourCCDigits',
      ],
    },
  ];

  for (const tenant of tenants) {
    await db.collection(collections.tenants).doc(tenant.id).set(tenant);
  }

  // Create test users
  const users: User[] = [
    {
      id: uuidv4(),
      email: 'employee1@rocketmoney.com',
      name: 'Rocket Employee 1',
      tenantId: tenants[0].id,
      tenantName: 'RocketMoney',
      tenantType: 'proxy',
      role: 'user',
      createdAt: currentDate,
      version: CURRENT_SCHEMA_VERSION,
    },
    {
      id: uuidv4(),
      email: 'employee2@rocketmoney.com',
      name: 'Rocket Employee 2',
      tenantId: tenants[0].id,
      tenantName: 'RocketMoney',
      tenantType: 'proxy',
      role: 'user',
      createdAt: currentDate,
      version: CURRENT_SCHEMA_VERSION,
    },
    {
      id: uuidv4(),
      email: 'employee1@billshark.com',
      name: 'BillShark Employee 1',
      tenantId: tenants[1].id,
      tenantName: 'BillShark',
      tenantType: 'proxy',
      role: 'user',
      createdAt: currentDate,
      version: CURRENT_SCHEMA_VERSION,
    },
    {
      id: uuidv4(),
      email: 'employee1@espn.com',
      name: 'Coach Bryant',
      tenantId: tenants[2].id,
      tenantName: 'ESPN',
      tenantType: 'provider',
      role: 'user',
      createdAt: currentDate,
      version: CURRENT_SCHEMA_VERSION,
    },
    {
      id: uuidv4(),
      email: 'employee1@netflix.com',
      name: 'Peter Parker',
      tenantId: tenants[3].id,
      tenantName: 'Netflix',
      tenantType: 'provider',
      role: 'user',
      createdAt: currentDate,
      version: CURRENT_SCHEMA_VERSION,
    },
    {
      id: uuidv4(),
      email: 'admin@espn.com',
      name: 'Admin ESPN',
      tenantId: tenants[2].id,
      tenantName: 'ESPN',
      tenantType: 'provider',
      role: 'admin',
      createdAt: currentDate,
      version: CURRENT_SCHEMA_VERSION,
    },
    {
      id: uuidv4(),
      email: 'employee1@democorp.com',
      name: 'Zephyr Stormwind',
      tenantId: tenants[tenants.length - 1].id,
      tenantName: 'Demo Corp',
      tenantType: 'provider',
      role: 'user',
      createdAt: currentDate,
      version: CURRENT_SCHEMA_VERSION,
    },
    {
      id: uuidv4(),
      email: 'admin@democorp.com',
      name: 'Nova Starlight',
      tenantId: tenants[tenants.length - 1].id,
      tenantName: 'Demo Corp',
      tenantType: 'provider',
      role: 'admin',
      createdAt: currentDate,
      version: CURRENT_SCHEMA_VERSION,
    },
  ];

  for (const user of users) {
    try {
      const standardPassword = 'q1w2e3';

      // Create user in Firebase Authentication
      const userRecord = await auth.createUser({
        uid: user.id,
        email: user.email,
        password: standardPassword,
        displayName: user.name,
      });

      // Set custom claims for JWT tokens
      await auth.setCustomUserClaims(userRecord.uid, {
        tenantId: user.tenantId,
        tenantType: user.tenantType,
        tenantName: user.tenantName,
        role: user.role,
      });

      // Create user document in Firestore
      await db.collection(collections.users).doc(user.id).set(user);

      console.log(`User created successfully: ${user.email}`);
    } catch (error) {
      console.error(`Error creating user ${user.email}:`, error);
    }
  }

  console.log('Test data initialized');
}

initializeDatabase()
  .then(() => console.log('Database initialized successfully'))
  .catch(console.error);
