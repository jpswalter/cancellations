import { NextResponse } from 'next/server';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { initializeFirebaseAdmin } from '@/lib/firebase/admin';
import { CustomerInfoField, Tenant, TenantType, User } from '@/lib/db/schema';
import { parseErrorMessage } from '@/utils/general';

initializeFirebaseAdmin();

export type TenantStats = {
  id: string; // Unique identifier for the tenant
  name: string; // Name of the tenant organization
  type: TenantType; // Type of the tenant (proxy or provider)
  userCount: number; // Number of users associated with this tenant
  requestCount: number; // Number of requests associated with this tenant
  connectedTenants: {
    // List of tenants connected to this tenant
    id: string; // ID of the connected tenant
    name: string; // Name of the connected tenant
  }[];
  adminEmails: string[];
  requiredCustomerInfo?: CustomerInfoField[];
};

export async function GET(): Promise<NextResponse> {
  const db: Firestore = getFirestore();

  try {
    const tenantsSnapshot = await db.collection('tenants').get();
    const tenants = tenantsSnapshot.docs.map(
      doc => ({ id: doc.id, ...doc.data() }) as Tenant,
    );

    const stats: TenantStats[] = await Promise.all(
      tenants.map(async tenant => {
        const usersSnapshot = await db
          .collection('users')
          .where('tenantId', '==', tenant.id)
          .get();
        const users = usersSnapshot.docs.map(doc => doc.data() as User);
        const userCount = users.length;
        const adminEmails = users
          .filter(user => user.role === 'admin')
          .map(admin => admin.email);

        const requestCount = (
          await db
            .collection('requests')
            .where(
              tenant.type === 'proxy' ? 'proxyTenantId' : 'providerTenantId',
              '==',
              tenant.id,
            )
            .count()
            .get()
        ).data().count;

        const connectedTenantsSnapshot = await db
          .collection('requests')
          .where(
            tenant.type === 'proxy' ? 'proxyTenantId' : 'providerTenantId',
            '==',
            tenant.id,
          )
          .select(
            tenant.type === 'proxy' ? 'providerTenantId' : 'proxyTenantId',
          )
          .get();

        const connectedTenantIds = new Set(
          connectedTenantsSnapshot.docs.map(doc =>
            tenant.type === 'proxy'
              ? doc.data().providerTenantId
              : doc.data().proxyTenantId,
          ),
        );

        const connectedTenants = tenants
          .filter(t => connectedTenantIds.has(t.id))
          .map(t => ({ id: t.id, name: t.name }));

        return {
          id: tenant.id,
          name: tenant.name,
          type: tenant.type,
          userCount,
          requestCount,
          connectedTenants,
          adminEmails,
          requiredCustomerInfo: tenant.requiredCustomerInfo,
        };
      }),
    );

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching tenant stats:', error);
    return NextResponse.json(
      { error: 'Error fetching tenant stats: ' + parseErrorMessage(error) },
      { status: 500 },
    );
  }
}
