// file: app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { CsvError, parse } from 'csv-parse';
import { StructuredCSVResponse } from '@/components/UploadCSV/upload.types';
import { getCustomerAuthField } from '@/utils/template.utils';
import { CustomerInfoField, RequestType, Tenant } from '@/lib/db/schema';
import { initializeFirebaseAdmin } from '@/lib/firebase/admin';
import { getFirestore } from 'firebase-admin/firestore';

const CSV_DELIMITER = [',', ';', '|', ':', '\t'];
const MAX_NUMBER_OF_ROWS = 500;

const getTenantById = async (tenantId: string): Promise<Tenant | null> => {
  initializeFirebaseAdmin();
  const db = getFirestore();
  const tenantRef = db.collection('tenants').doc(tenantId);
  const tenantDoc = await tenantRef.get();

  return tenantDoc.data() as Tenant | null;
};

export async function POST(request: NextRequest): Promise<void | Response> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const providerId = formData.get('providerId') as string;
    const requestType = formData.get('requestType') as RequestType;

    if (!file || !providerId || !requestType) {
      console.log('Missing required fields', {
        file,
        providerId,
        requestType,
      });
      return NextResponse.json(
        {
          error: 'Missing required fields.',
          status: 'error',
          headers: [],
          data: [],
        },
        { status: 400 },
      );
    }

    if (file.type !== 'text/csv') {
      console.log('Invalid file type', { file });
      return NextResponse.json(
        { error: 'Invalid file type.', status: 'error', headers: [], data: [] },
        { status: 400 },
      );
    }

    const provider = await getTenantById(providerId);
    if (!provider) {
      return NextResponse.json(
        {
          error: 'Provider not found.',
          status: 'error',
          headers: [],
          data: [],
        },
        { status: 404 },
      );
    }

    const requiredFields = provider.requiredCustomerInfo || [];

    const buffer = Buffer.from(await file.arrayBuffer());
    const results: string[][] = [];

    return new Promise(resolve => {
      parse(buffer, { delimiter: CSV_DELIMITER })
        .on('data', data => results.push(data))
        .on('error', err => {
          const response: StructuredCSVResponse = {
            status: 'error',
            error:
              err instanceof CsvError
                ? `Row ${err?.records} contains invalid amount of columns. There might be a typo with an extra delimiter in one of the cells.`
                : err.message,
            headers: [],
            data: [],
          };
          return resolve(NextResponse.json(response, { status: 500 }));
        })
        .on('end', () => {
          if (results.length <= 1) {
            return resolve(
              NextResponse.json(
                {
                  status: 'error',
                  error:
                    'The file uploaded does not contain any data, please check the file and try again.',
                  headers: [],
                  data: [],
                },
                { status: 400 },
              ),
            );
          }
          if (results.length > MAX_NUMBER_OF_ROWS + 1) {
            return resolve(
              NextResponse.json(
                {
                  status: 'error',
                  error: `Please ensure your file has ${MAX_NUMBER_OF_ROWS} rows or fewer and try again.`,
                  headers: [],
                  data: [],
                },
                { status: 400 },
              ),
            );
          }

          const headers = results[0].map(getCustomerAuthField);
          const validHeaders = headers.filter(
            (header): header is CustomerInfoField => header !== undefined,
          );

          if (validHeaders.length !== headers.length) {
            return resolve(
              NextResponse.json(
                {
                  status: 'error',
                  error:
                    'One or more header names are incorrect. Please check the CSV file headers and try again.',
                  headers: [],
                  data: [],
                },
                { status: 400 },
              ),
            );
          }

          const missingColumns = requiredFields.filter(
            field => !validHeaders.includes(field),
          );
          const extraColumns = validHeaders.filter(
            header => !requiredFields.includes(header),
          );
          const columnNameMismatches = requiredFields.filter(
            field =>
              !validHeaders.includes(field) &&
              validHeaders.some(
                header => header.toLowerCase() === field.toLowerCase(),
              ),
          );

          let error = null;
          if (missingColumns.length > 0) {
            error = `Missing required columns: ${missingColumns.join(', ')}. All data defined by the provider as needed for ${requestType} requests must be included to qualify for support.`;
          }

          if (error) {
            return resolve(
              NextResponse.json(
                {
                  status: 'error',
                  error,
                  headers: validHeaders,
                  data: [],
                },
                { status: 400 },
              ),
            );
          }

          const data = results.slice(1).map(row => {
            const rowData: Record<string, string> = {};
            validHeaders.forEach((header, index) => {
              rowData[header] = row[index] || '';
            });
            return rowData;
          });

          let warningMessage = '';
          if (extraColumns.length > 0) {
            warningMessage += `Extra columns found: ${extraColumns.join(', ')}. These will be ignored. `;
          }
          if (columnNameMismatches.length > 0) {
            warningMessage += `Column name mismatches found. Please ensure exact matches for: ${columnNameMismatches.join(', ')}. `;
          }

          const response: StructuredCSVResponse = {
            status: 'success',
            error: warningMessage || null,
            headers: validHeaders,
            data,
          };
          return resolve(NextResponse.json(response, { status: 200 }));
        });
    });
  } catch (err) {
    console.log('upload error', err);
    return NextResponse.json(
      {
        status: 'error',
        error: 'An unexpected error occurred',
        headers: [],
        data: [],
      },
      { status: 500 },
    );
  }
}
