import { calculateStats } from '../stats';
import { logsMock } from '../../tests/mocks/logs';
import { tenantsMock } from '../../tests/mocks/tenants';
import { Firestore } from 'firebase-admin/firestore';
import {
  requestsForDemoCorpMock,
  requestsForESPNMock,
} from '@/lib/tests/mocks/requests';
import { Request } from '@/lib/db/schema';

type MockData = {
  requests: Request[];
  requestsLog: typeof logsMock;
  tenants: typeof tenantsMock;
};

const createMockFirestore = (mockData: MockData): jest.Mocked<Firestore> => {
  const mockWhere = jest.fn().mockReturnThis();
  const mockCollection = jest
    .fn()
    .mockImplementation((collectionName: string) => {
      return {
        where: mockWhere,
        get: jest.fn().mockImplementation(() => {
          const data = mockData[collectionName as keyof MockData] || [];
          return Promise.resolve({
            docs: data.map(doc => ({
              data: () => doc,
            })),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            forEach: (callback: (doc: any) => void) => {
              data.forEach(doc => callback({ data: () => doc }));
            },
          });
        }),
      };
    });

  return {
    collection: mockCollection,
  } as unknown as jest.Mocked<Firestore>;
};
describe('calculateStats', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-08-30T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('calculates stats correctly for a provider tenant', async () => {
    const providerTenantId = '97d769fb-62c5-4a50-be96-9806b11f97cf';
    const mockData: MockData = {
      requests: requestsForDemoCorpMock.filter(
        r => r.providerTenantId === providerTenantId,
      ) as Request[],
      requestsLog: logsMock,
      tenants: tenantsMock,
    };

    const mockFirestore = createMockFirestore(mockData);

    const result = await calculateStats({
      db: mockFirestore,
      tenantType: 'provider',
      tenantId: providerTenantId,
    });
    expect(result.requests.totalCount).toBe(5);
    expect(result.requests.statusCounts).toEqual({
      Pending: 2,
      Canceled: 1,
      Declined: 1,
      'Save Offered': 1,
      'Save Declined': 0,
      'Save Accepted': 0,
      'Save Confirmed': 0,
    });
    expect(result.requests.averageResponseTime).toBe(0.1);
    expect(result.requests.dailyVolume['2024-08-30']).toBe(10);
    expect(result.requests.sourceDistribution).toEqual({
      'b5d658d4-c9d7-4336-aabe-631f6473f873': 5,
    });
    expect(result.requests.saveOfferCounts).toEqual({
      offered: 1,
      accepted: 0,
      declined: 0,
    });
    expect(result.tenants).toHaveLength(1);
  });

  it('calculates stats correctly for a proxy tenant', async () => {
    const proxyTenantId = 'b5d658d4-c9d7-4336-aabe-631f6473f873';
    const mockData: MockData = {
      requests: requestsForDemoCorpMock.filter(
        r => r.proxyTenantId === proxyTenantId,
      ) as Request[],
      requestsLog: logsMock,
      tenants: tenantsMock,
    };
    const mockFirestore = createMockFirestore(mockData);

    const result = await calculateStats({
      db: mockFirestore,
      tenantType: 'proxy',
      tenantId: proxyTenantId,
    });

    expect(result.requests.totalCount).toBe(mockData.requests.length);
    expect(result.tenants).toHaveLength(1);
  });

  it('handles early month scenario correctly', async () => {
    jest.setSystemTime(new Date('2024-09-03T12:00:00Z'));
    const providerTenantId = '97d769fb-62c5-4a50-be96-9806b11f97cf';
    const mockData: MockData = {
      requests: requestsForDemoCorpMock.filter(
        r => r.providerTenantId === providerTenantId,
      ) as Request[],
      requestsLog: logsMock,
      tenants: tenantsMock,
    };
    const mockFirestore = createMockFirestore(mockData);

    const result = await calculateStats({
      db: mockFirestore,
      tenantType: 'provider',
      tenantId: providerTenantId,
    });

    const dailyVolumeKeys = Object.keys(result.requests.dailyVolume);
    expect(dailyVolumeKeys).toContain('2024-08-29');
    expect(dailyVolumeKeys).toContain('2024-09-03');
    expect(dailyVolumeKeys.length).toBeGreaterThanOrEqual(6); // At least 5 days from previous month + current day
    expect(dailyVolumeKeys.length).toBeLessThanOrEqual(8); // Allow for up to 7 days from previous month + current day
  });

  it('handles case with no requests', async () => {
    const mockData: MockData = {
      requests: [],
      requestsLog: [],
      tenants: tenantsMock,
    };
    const mockFirestore = createMockFirestore(mockData);

    const result = await calculateStats({
      db: mockFirestore,
      tenantType: 'provider',
      tenantId: 'nonexistent',
    });

    expect(result.requests.totalCount).toBe(0);
    expect(result.requests.averageResponseTime).toBe(0);
    expect(
      Object.values(result.requests.statusCounts).every(count => count === 0),
    ).toBe(true);
    expect(
      Object.values(result.requests.dailyVolume).every(count => count === 0),
    ).toBe(true);
    expect(Object.keys(result.requests.sourceDistribution).length).toBe(0);
    expect(result.requests.saveOfferCounts).toEqual({
      offered: 0,
      accepted: 0,
      declined: 0,
    });
  });

  describe('Save offer counts', () => {
    it('calculates save offer counts correctly for Demo Corp', async () => {
      const providerTenantId = '97d769fb-62c5-4a50-be96-9806b11f97cf';
      const filteredRequests = requestsForDemoCorpMock.filter(
        r => r.providerTenantId === providerTenantId,
      );
      const filteredLogs = logsMock.filter(log =>
        filteredRequests.some(request => request.id === log.requestId),
      );
      const mockData: MockData = {
        requests: filteredRequests as Request[],
        requestsLog: filteredLogs,
        tenants: tenantsMock,
      };
      const mockFirestore = createMockFirestore(mockData);

      const result = await calculateStats({
        db: mockFirestore,
        tenantType: 'provider',
        tenantId: providerTenantId,
      });

      const saveOfferLogs = filteredLogs.filter(log =>
        log.changes.some(
          change =>
            change.field === 'status' &&
            typeof change.newValue === 'string' &&
            change.newValue.startsWith('Save'),
        ),
      );

      const expectedOffered = saveOfferLogs.filter(log =>
        log.changes.some(change => change.newValue === 'Save Offered'),
      ).length;
      const expectedAccepted = saveOfferLogs.filter(log =>
        log.changes.some(change => change.newValue === 'Save Accepted'),
      ).length;
      const expectedDeclined = saveOfferLogs.filter(log =>
        log.changes.some(change => change.newValue === 'Save Declined'),
      ).length;

      expect(result.requests.saveOfferCounts.offered).toBe(expectedOffered);
      expect(result.requests.saveOfferCounts.accepted).toBe(expectedAccepted);
      expect(result.requests.saveOfferCounts.declined).toBe(expectedDeclined);
    });

    it('calculates save offer counts correctly for ESPN', async () => {
      const providerTenantId = 'ba9270be-6274-41c0-be0a-73e4fe639d39';
      const filteredRequests = requestsForESPNMock.filter(
        r => r.providerTenantId === providerTenantId,
      );
      const filteredLogs = logsMock.filter(log =>
        filteredRequests.some(request => request.id === log.requestId),
      );
      const mockData: MockData = {
        requests: filteredRequests as Request[],
        requestsLog: filteredLogs,
        tenants: tenantsMock,
      };
      const mockFirestore = createMockFirestore(mockData);

      const result = await calculateStats({
        db: mockFirestore,
        tenantType: 'provider',
        tenantId: providerTenantId,
      });

      const saveOfferLogs = filteredLogs.filter(log =>
        log.changes.some(
          change =>
            change.field === 'status' &&
            typeof change.newValue === 'string' &&
            change.newValue.startsWith('Save'),
        ),
      );

      const expectedOffered = saveOfferLogs.filter(log =>
        log.changes.some(change => change.newValue === 'Save Offered'),
      ).length;
      const expectedAccepted = saveOfferLogs.filter(log =>
        log.changes.some(change => change.newValue === 'Save Accepted'),
      ).length;
      const expectedDeclined = saveOfferLogs.filter(log =>
        log.changes.some(change => change.newValue === 'Save Declined'),
      ).length;

      expect(result.requests.saveOfferCounts.offered).toBe(expectedOffered);
      expect(result.requests.saveOfferCounts.accepted).toBe(expectedAccepted);
      expect(result.requests.saveOfferCounts.declined).toBe(expectedDeclined);
    });
  });
});
