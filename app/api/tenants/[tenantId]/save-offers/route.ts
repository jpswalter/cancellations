// file: app/api/tenants/[id]/save-offers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, Firestore, FieldValue } from 'firebase-admin/firestore';
import { initializeFirebaseAdmin } from '@/lib/firebase/admin';
import { SaveOffer, Tenant } from '@/lib/db/schema';
import { parseErrorMessage } from '@/utils/general';

initializeFirebaseAdmin();

/**
 * Handles the POST request to create a new save offer for a tenant.
 *
 * @param {NextRequest} request - The incoming request object.
 * @param {string} params.tenantId - The ID of the tenant.
 * @returns {Promise<NextResponse>} - The response object.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { tenantId: string } },
) {
  const { tenantId } = params;

  if (!tenantId) {
    return NextResponse.json({ message: 'Invalid tenant ID' }, { status: 400 });
  }

  const db: Firestore = getFirestore();
  const tenantRef = db.collection('tenants').doc(tenantId);

  try {
    const newOffer: Partial<SaveOffer> = await request.json();

    // Validate the new offer data
    if (!newOffer.title || !newOffer.description) {
      return NextResponse.json(
        { message: 'Title and description are required' },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    const saveOffer: SaveOffer = {
      id: db.collection('tenants').doc().id, // Generate a new ID
      dateCreated: now,
      dateUpdated: null,
      title: newOffer.title,
      description: newOffer.description,
    };

    // Update the tenant document by adding the new save offer
    await tenantRef.update({
      saveOffers: FieldValue.arrayUnion(saveOffer),
    });

    // Fetch the updated tenant to return the complete saveOffers array
    const updatedTenantDoc = await tenantRef.get();
    const updatedTenant = updatedTenantDoc.data() as Tenant;

    return NextResponse.json(
      {
        message: `Save offer "${newOffer.title}" added successfully`,
        saveOffers: updatedTenant.saveOffers,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error creating save offer:', error);
    return NextResponse.json(
      { message: parseErrorMessage(error) },
      { status: 500 },
    );
  }
}
