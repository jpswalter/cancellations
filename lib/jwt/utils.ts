import jwt from 'jsonwebtoken';
import { TenantType } from '../db/schema';

export type NewUserData = {
  tenantType: TenantType;
  tenantName: string;
  tenantId: string;
  email: string;
  isAdmin: boolean;
  name: string;
};

export const generateInvitationToken = (
  { tenantType, tenantName, tenantId, email, isAdmin, name }: NewUserData,
  expiresIn = '24h',
) => {
  const payload = {
    tenantType,
    tenantName,
    tenantId,
    email,
    isAdmin,
    name,
  };

  const SECRET_KEY = process.env.JWT_SECRET_KEY;

  if (!SECRET_KEY) {
    throw new Error('Missing secret key');
  }

  return jwt.sign(payload, SECRET_KEY, { expiresIn });
};

export const decodeToken = (
  token: string | null,
): NewUserData | 'expired' | null => {
  if (!token) {
    return null;
  }

  try {
    const SECRET_KEY = process.env.JWT_SECRET_KEY;
    if (!SECRET_KEY) {
      throw new Error('Missing secret key');
    }

    const payload = jwt.verify(token, SECRET_KEY);
    return payload as NewUserData;
  } catch (error) {
    console.log(error);
    if (error instanceof jwt.TokenExpiredError) {
      return 'expired';
    }
    return null;
  }
};
