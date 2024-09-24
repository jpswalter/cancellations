"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateTenantStats = void 0;
const firestore_1 = require("firebase-admin/firestore");
const https_1 = require("firebase-functions/v2/https");
const date_fns_1 = require("date-fns");
const params_1 = require("firebase-functions/params");
const admin = __importStar(require("firebase-admin"));
const ALL_STATUSES = [
    'Pending',
    'Canceled',
    'Declined',
    'Save Offered',
    'Save Declined',
    'Save Accepted',
    'Save Confirmed',
];
exports.calculateTenantStats = (0, https_1.onCall)((request) => __awaiter(void 0, void 0, void 0, function* () {
    const PL_FIREBASE_PROJECT_ID = (0, params_1.defineString)('PL_FIREBASE_PROJECT_ID');
    const PL_FIREBASE_CLIENT_EMAIL = (0, params_1.defineString)('PL_FIREBASE_CLIENT_EMAIL');
    const PL_FIREBASE_PRIVATE_KEY = (0, params_1.defineString)('PL_FIREBASE_PRIVATE_KEY');
    console.log('Params defined:', PL_FIREBASE_PROJECT_ID.value(), PL_FIREBASE_CLIENT_EMAIL.value(), PL_FIREBASE_PRIVATE_KEY.value());
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: PL_FIREBASE_PROJECT_ID.value(),
            clientEmail: PL_FIREBASE_CLIENT_EMAIL.value(),
            privateKey: PL_FIREBASE_PRIVATE_KEY.value(),
        }),
    });
    const { tenantType, tenantId, fromDate, toDate, sourceId } = request.data;
    if (!tenantType || !tenantId) {
        throw new https_1.HttpsError('invalid-argument', 'Tenant information is required');
    }
    const db = (0, firestore_1.getFirestore)();
    let query = db.collection('requests');
    if (tenantType === 'proxy') {
        query = query.where('proxyTenantId', '==', tenantId);
    }
    else {
        query = query.where('providerTenantId', '==', tenantId);
    }
    if (fromDate) {
        query = query.where('dateSubmitted', '>=', fromDate);
    }
    if (toDate) {
        query = query.where('dateSubmitted', '<=', toDate);
    }
    if (sourceId && tenantType === 'provider') {
        query = query.where('proxyTenantId', '==', sourceId);
    }
    const [requestsSnapshot, logsSnapshot, tenantsSnapshot] = yield Promise.all([
        query.get(),
        db.collection('requestsLog').get(),
        db.collection('tenants').get(),
    ]);
    const requests = requestsSnapshot.docs.map(doc => doc.data());
    const logs = logsSnapshot.docs.map(doc => doc.data());
    const tenants = tenantsSnapshot.docs.map(doc => doc.data());
    const logMap = new Map(logs.map(log => [log.requestId, log]));
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    let totalResponseTimeDays = 0;
    let respondedRequestsCount = 0;
    const statusCounts = ALL_STATUSES.reduce((acc, status) => {
        acc[status] = 0;
        return acc;
    }, {});
    const dailyVolume = {};
    const sourceDistribution = {};
    const saveOfferCounts = { offered: 0, accepted: 0, declined: 0 };
    const today = new Date();
    const isEarlyInMonth = today.getDate() <= 5;
    let startDate;
    if (isEarlyInMonth) {
        startDate = (0, date_fns_1.subDays)((0, date_fns_1.startOfMonth)(today), 5);
    }
    else {
        startDate = (0, date_fns_1.startOfMonth)(today);
    }
    let currentDate = startDate;
    while ((0, date_fns_1.isBefore)(currentDate, today) ||
        (0, date_fns_1.format)(currentDate, 'yyyy-MM-dd') === (0, date_fns_1.format)(today, 'yyyy-MM-dd')) {
        const dateKey = (0, date_fns_1.format)(currentDate, 'yyyy-MM-dd');
        dailyVolume[dateKey] = 0;
        currentDate = (0, date_fns_1.addDays)(currentDate, 1);
    }
    for (const request of requests) {
        const submitDate = new Date(request.dateSubmitted);
        if ((0, date_fns_1.isBefore)(submitDate, startDate))
            continue;
        const dateKey = (0, date_fns_1.format)(submitDate, 'yyyy-MM-dd');
        if (dateKey in dailyVolume) {
            dailyVolume[dateKey]++;
        }
        // Status counts
        statusCounts[request.status]++;
        // Daily volume
        if (submitDate >= thirtyDaysAgo) {
            const dateKey = submitDate.toISOString().split('T')[0];
            dailyVolume[dateKey] = (dailyVolume[dateKey] || 0) + 1;
        }
        // Average response time
        if (request.dateResponded) {
            const responseTimeMs = new Date(request.dateResponded).getTime() -
                new Date(request.dateSubmitted).getTime();
            totalResponseTimeDays += responseTimeMs / (1000 * 60 * 60 * 24); // Convert to days
            respondedRequestsCount++;
        }
        // Source distribution
        sourceDistribution[request.proxyTenantId] =
            (sourceDistribution[request.proxyTenantId] || 0) + 1;
        // Save offer counts
        const log = logMap.get(request.id);
        if (log) {
            for (const change of log.changes) {
                if (change.field === 'status') {
                    if (change.newValue === 'Save Offered')
                        saveOfferCounts.offered++;
                    if (change.newValue === 'Save Accepted')
                        saveOfferCounts.accepted++;
                    if (change.newValue === 'Save Declined')
                        saveOfferCounts.declined++;
                }
            }
        }
    }
    const averageResponseTime = respondedRequestsCount > 0
        ? totalResponseTimeDays / respondedRequestsCount
        : 0;
    const uniqueTenantIds = new Set(requests.map(request => request.proxyTenantId));
    const relevantTenants = tenants.filter(tenant => uniqueTenantIds.has(tenant.id));
    return {
        requests: {
            totalCount: requests.length,
            statusCounts,
            averageResponseTime: Math.round(averageResponseTime * 10) / 10, // Round to 0.1
            dailyVolume,
            sourceDistribution,
            saveOfferCounts,
        },
        tenants: relevantTenants.map(({ id, name }) => ({ id, name })),
    };
}));
