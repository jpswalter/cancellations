// file: lib/api/user.ts

import { parseErrorMessage } from '@/utils/general';
import { User } from 'firebase/auth';

/**
 * Sends a PATCH request to update the user's info.
 * @param {string} id - The user ID.
 * @param {string} name - The updated name.
 * @returns {Promise<void>} A promise indicating the success or failure of the update.
 * @throws {Error} If the request fails.
 */
export const updateUser = async ({
  id,
  firstName,
  lastName,
}: {
  id: string;
  firstName: string;
  lastName: string;
}): Promise<void> => {
  const response = await fetch('/api/users/' + id, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      firstName,
      lastName,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update user');
  }
};

export const fetchUsers = async (): Promise<User[]> => {
  const response = await fetch('/api/users');
  if (!response.ok) {
    const error = await response.json();
    const message = parseErrorMessage(error);
    throw new Error(message);
  }
  return response.json();
};
