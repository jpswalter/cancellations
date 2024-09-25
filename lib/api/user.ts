import { parseErrorMessage } from '@/utils/general';
import { TenantType, User, Invitation } from '@/lib/db/schema';

/**
 * Sends a PATCH request to update the user's info.
 * @param {string} id - The user ID.
 * @param {string} name - The updated name.
 * @returns {Promise<User | Error>} A promise indicating the success or failure of the update.
 * @throws {Error} If the request fails.
 */
export const updateUser = async ({
  id,
  firstName,
  lastName,
  role,
}: {
  id: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user';
}): Promise<{ message: string } | Error> => {
  const response = await fetch('/api/users/' + id, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      firstName,
      lastName,
      role,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error(parseErrorMessage(error));
    throw new Error('Failed to update user');
  }

  return response.json();
};

export const getUsers = async ({
  tenantId,
}: {
  tenantId: string;
}): Promise<User[] | Error> => {
  try {
    const response = await fetch('/api/users?tenantId=' + tenantId, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get users');
    }

    const users = await response.json();
    return users;
  } catch (error) {
    return new Error(parseErrorMessage(error));
  }
};

export const inviteUser = async ({
  tenantId,
  sendTo,
  invitedBy,
  tenantType,
  tenantName,
  isAdmin = false,
}: {
  sendTo: string;
  invitedBy: string;
  tenantType: TenantType;
  tenantName: string;
  tenantId: string;
  isAdmin?: boolean;
}): Promise<Invitation | Error> => {
  try {
    const response = await fetch('/api/invite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        isAdmin,
        invitedBy,
        tenantType,
        tenantName,
        tenantId,
        sendTo,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to invite user');
    }

    const invitation: Invitation = await response.json();
    return invitation;
  } catch (error) {
    return new Error(parseErrorMessage(error));
  }
};

export const getInvitations = async (
  tenantId: string,
): Promise<Invitation[] | Error> => {
  try {
    const response = await fetch(`/api/invitations?tenantId=${tenantId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get invitations');
    }

    const invitations: Invitation[] = await response.json();
    return invitations;
  } catch (error) {
    return new Error(parseErrorMessage(error));
  }
};
