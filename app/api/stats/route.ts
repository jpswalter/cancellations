import { NextRequest, NextResponse } from 'next/server';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '@/lib/firebase/config';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const url = new URL(req.url);
  const tenantType = url.searchParams.get('tenantType') as
    | 'proxy'
    | 'provider'
    | null;
  const tenantId = url.searchParams.get('tenantId');
  const fromDate = url.searchParams.get('fromDate');
  const toDate = url.searchParams.get('toDate');
  const sourceId = url.searchParams.get('sourceId');

  if (!tenantType || !tenantId) {
    return new NextResponse(
      JSON.stringify({ error: 'Missing tenant information' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  try {
    const functions = getFunctions(app, 'us-central1');
    console.log('functions', functions);
    const calculateTenantStats = httpsCallable(
      functions,
      'calculateTenantStats',
    );
    console.log('calculateTenantStats', calculateTenantStats);
    console.log('GET calculateTenantStats calling args', {
      tenantType,
      tenantId,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      sourceId: sourceId || undefined,
    });
    const result = await calculateTenantStats({
      data: {
        tenantType,
        tenantId,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        sourceId: sourceId || undefined,
      },
    });
    console.log('GET calculateTenantStats result', result);
    return new NextResponse(JSON.stringify(result.data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching stats', error);
    return new NextResponse(JSON.stringify({ error: 'Error fetching stats' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
