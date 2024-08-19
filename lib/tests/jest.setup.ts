// file: lib/tests/jest.setup.ts
import '@testing-library/jest-dom';

import { createMockRouter } from './mocks/router';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => createMockRouter()),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  })),
}));

jest.mock('jose', () => ({
  compactDecrypt: jest.fn(),
}));

jest.mock('firebase-admin/firestore', () => ({
  getFirestore: jest.fn(),
  FieldValue: {
    arrayUnion: jest.fn(),
  },
}));

jest.mock('firebase-admin/auth', () => ({
  getAuth: jest.fn(),
}));
