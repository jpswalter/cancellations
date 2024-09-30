// file: app/api/requests/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { initializeFirebaseAdmin } from '@/lib/firebase/admin';
import { parseErrorMessage } from '@/utils/general';
import {
  Request,
  RequestLog,
  RequestWithLog,
  TenantType,
} from '@/lib/db/schema';
import { createRequestLog } from '@/lib/firebase/logs';

initializeFirebaseAdmin();

/**
 * Handles GET requests to fetch requests based on tenant type and ID.
 * @param {NextRequest} req - The incoming request object.
 * @returns {Promise<NextResponse>} A response containing the fetched requests or an error message.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const url = new URL(req.url);
  const tenantType = url.searchParams.get('tenantType') as TenantType | null;
  const tenantId = url.searchParams.get('tenantId');
  const includeLog = url.searchParams.get('includeLog') === 'true';

  if (!tenantType || !tenantId) {
    return new NextResponse(
      JSON.stringify({ error: 'Missing tenant information' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  const db: Firestore = getFirestore();
  const requestsRef = db.collection('requests');
  let query;

  if (tenantType === 'proxy') {
    query = requestsRef.where('proxyTenantId', '==', tenantId);
  } else if (tenantType === 'provider') {
    query = requestsRef.where('providerTenantId', '==', tenantId);
  } else {
    return new NextResponse(JSON.stringify({ error: 'Invalid tenant type' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const snapshot = await query.get();
    const requests = await Promise.all(
      snapshot.docs.map(async doc => {
        const request = doc.data() as Request;
        if (includeLog) {
          const logRef = db.collection('requestsLog').doc(request.logId);
          const logDoc = await logRef.get();
          if (logDoc.exists) {
            return {
              ...request,
              log: logDoc.data() as RequestLog,
            } as RequestWithLog;
          }
        }
        return request;
      }),
    );

    return new NextResponse(JSON.stringify(requests), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: 'Error fetching requests' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}

/**
 * Handles POST requests to create multiple new requests.
 * @param {NextRequest} req - The incoming request object containing an array of requests.
 * @returns {Promise<NextResponse>} A response containing the created request IDs or an error message.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const db: Firestore = getFirestore();
    const { requests }: { requests: Omit<Request, 'id'>[] } = await req.json();

    if (!Array.isArray(requests)) {
      return new NextResponse(
        JSON.stringify({
          error: 'Invalid input: expected an array of requests',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    const batch = db.batch();
    const createdIds: string[] = [];

    for (const requestData of requests) {
      const docRef = db.collection('requests').doc();
      const logRef = db.collection('requestsLog').doc();
      const fullRequest = {
        ...requestData,
        id: docRef.id,
        logId: logRef.id,
      };
      batch.set(docRef, fullRequest);
      createdIds.push(docRef.id);
      await createRequestLog(fullRequest);
    }

    await batch.commit();

    return new NextResponse(JSON.stringify({ ids: createdIds }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({
        error: 'Failed to create requests: ' + parseErrorMessage(error),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}
