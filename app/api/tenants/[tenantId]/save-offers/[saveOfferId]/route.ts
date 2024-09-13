// file: app/api/tenants/[id]/save-offers/[id]/routes.ts
import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, Firestore, FieldValue } from 'firebase-admin/firestore';
import { initializeFirebaseAdmin } from '@/lib/firebase/admin';
import { SaveOffer, Tenant } from '@/lib/db/schema';

initializeFirebaseAdmin();

export async function PATCH(
  request: NextRequest,
  { params }: { params: { tenantId: string; saveOfferId: string } },
) {
  const { tenantId, saveOfferId } = params;

  if (!tenantId || !saveOfferId) {
    return NextResponse.json(
      { message: 'Invalid tenant ID or offer ID' },
      { status: 400 },
    );
  }

  const db: Firestore = getFirestore();
  const tenantRef = db.collection('tenants').doc(tenantId);

  try {
    const updateData: Partial<SaveOffer> = await request.json();

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { message: 'No update data provided' },
        { status: 400 },
      );
    }

    const tenantDoc = await tenantRef.get();
    if (!tenantDoc.exists) {
      return NextResponse.json(
        { message: 'Tenant not found' },
        { status: 404 },
      );
    }

    const tenant = tenantDoc.data() as Tenant;

    if (!tenant.saveOffers) {
      return NextResponse.json(
        { message: 'No save offers available' },
        { status: 404 },
      );
    }

    const offerIndex = tenant.saveOffers.findIndex(
      offer => offer.id === saveOfferId,
    );
    if (offerIndex === -1) {
      return NextResponse.json(
        { message: 'Save offer not found' },
        { status: 404 },
      );
    }

    const updatedOffer = {
      ...tenant.saveOffers[offerIndex],
      ...updateData,
      dateUpdated: new Date().toISOString(),
    };

    const updatedSaveOffers = [...tenant.saveOffers];
    updatedSaveOffers[offerIndex] = updatedOffer;

    await tenantRef.update({
      saveOffers: updatedSaveOffers,
    });

    return NextResponse.json(updatedOffer, {
      status: 200,
    });
  } catch (error) {
    console.error('Error updating save offer:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: { tenantId: string; saveOfferId: string } },
) {
  const { tenantId, saveOfferId } = params;

  if (!tenantId || !saveOfferId) {
    return NextResponse.json(
      { message: 'Invalid tenant ID or offer ID' },
      { status: 400 },
    );
  }

  const db: Firestore = getFirestore();
  const tenantRef = db.collection('tenants').doc(tenantId);

  try {
    const tenantDoc = await tenantRef.get();
    if (!tenantDoc.exists) {
      return NextResponse.json(
        { message: 'Tenant not found' },
        { status: 404 },
      );
    }

    const tenant = tenantDoc.data() as Tenant;
    const offerExists = tenant.saveOffers?.some(
      offer => offer.id === saveOfferId,
    );

    if (!offerExists) {
      return NextResponse.json(
        { message: 'Error: Save offer not found, contact support' },
        { status: 404 },
      );
    }

    // Remove the specific offer
    await tenantRef.update({
      saveOffers: FieldValue.arrayRemove(
        tenant.saveOffers?.find(offer => offer.id === saveOfferId),
      ),
    });

    return NextResponse.json(
      { message: 'Save offer deleted successfully' },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error deleting save offer:', error);
    return NextResponse.json(
      { message: 'Error: Delete failed, contact support' },
      { status: 500 },
    );
  }
}
