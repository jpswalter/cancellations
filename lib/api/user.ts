// file: lib/api/user.ts

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
  const response = await fetch('/api/user/' + id, {
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
