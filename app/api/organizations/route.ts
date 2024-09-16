import { NextResponse } from 'next/server';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { initializeFirebaseAdmin } from '@/lib/firebase/admin';
import { CURRENT_SCHEMA_VERSION, Tenant, User } from '@/lib/db/schema';
import { parseErrorMessage } from '@/utils/general';
import { Organization } from '@/lib/api/organization';
import { sendEmailInvitation } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';

initializeFirebaseAdmin();

export async function GET(): Promise<NextResponse> {
  const db: Firestore = getFirestore();

  try {
    const tenantsSnapshot = await db.collection('tenants').get();
    const tenants = tenantsSnapshot.docs.map(
      doc => ({ id: doc.id, ...doc.data() }) as Tenant,
    );

    const stats: Organization[] = await Promise.all(
      tenants.map(async tenant => {
        const usersSnapshot = await db
          .collection('users')
          .where('tenantId', '==', tenant.id)
          .get();
        const users = usersSnapshot.docs.map(doc => doc.data() as User);
        const userCount = users.length;

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
          adminEmails: tenant.admins,
          requiredCustomerInfo: tenant.requiredCustomerInfo,
          active: tenant.active,
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

export async function POST(request: Request): Promise<NextResponse> {
  const db: Firestore = getFirestore();

  try {
    const { orgName, userName, adminEmails, orgType, authFields } =
      await request.json();

    const newTenant: Tenant = {
      id: uuidv4(),
      version: CURRENT_SCHEMA_VERSION,
      name: orgName,
      type: orgType,
      createdAt: new Date().toISOString(),
      active: false,
      requiredCustomerInfo: authFields,
      saveOffers: [],
      admins: adminEmails,
    };

    await db.collection('tenants').doc(newTenant.id).set(newTenant);

    // Invite all admins
    const invitePromises = adminEmails.map((email: string) =>
      sendEmailInvitation({
        sendTo: email,
        isAdmin: true,
        invitedBy: 'john@proxylink.co',
        tenantType: orgType,
        tenantName: orgName,
        tenantId: newTenant.id,
        name: userName,
      }),
    );

    await Promise.all(invitePromises);

    return NextResponse.json(
      {
        message: `Organization created and invitation${
          adminEmails.length > 1 ? 's' : ''
        } sent successfully`,
        tenant: newTenant,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error creating tenant:', error);
    return NextResponse.json(
      { error: 'Error creating tenant: ' + parseErrorMessage(error) },
      { status: 500 },
    );
  }
}
