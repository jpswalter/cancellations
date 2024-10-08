// file: lib/api/tenant.ts
import { Tenant, SaveOffer } from '@/lib/db/schema';

type GetTenantsParams = {
  filterBy?: string;
  filterValue?: string;
  minimal?: boolean;
};

/**
 * Sends a GET request to fetch tenants based on tenant type and ID.
 * @returns {Promise<Tenant[]>} A promise that resolves to an array of tenants.
 * @throws {Error} If the request fails.
 */
export const getTenants = async (
  options?: GetTenantsParams,
): Promise<Tenant[]> => {
  const { filterBy, filterValue, minimal } = options || {};
  try {
    let url = '/api/tenants';
    const params = new URLSearchParams();

    if (filterBy && filterValue) {
      params.append(filterBy, filterValue);
    }
    if (minimal) {
      params.append('minimal', 'true');
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, { next: { revalidate: 0 } });
    if (!response.ok) {
      throw new Error('Failed to fetch tenants');
    }
    return await response.json();
  } catch (error) {
    throw new Error('Error getting tenants: ' + (error as Error).message);
  }
};

/**
 * Sends a POST request to create a new save offer for a tenant.
 * @param {string} tenantId - The ID of the tenant.
 * @param {Partial<SaveOffer>} newOffer - The new offer to be created.
 * @returns {Promise<SaveOffer>} A promise that resolves to the created save offer.
 * @throws {Error} If the request fails.
 */
export const createSaveOffer = async (
  tenantId: string,
  newOffer: Partial<SaveOffer>,
): Promise<SaveOffer> => {
  try {
    const response = await fetch(`/api/tenants/${tenantId}/save-offers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newOffer),
    });
    if (!response.ok) {
      throw new Error('Failed to create save offer');
    }
    return await response.json();
  } catch (error) {
    throw new Error('Error creating save offer: ' + (error as Error).message);
  }
};

/**
 * Sends a PATCH request to update an existing save offer for a tenant.
 * @param {string} tenantId - The ID of the tenant.
 * @param {Partial<SaveOffer>} updatedOffer - The fields to be updated in the offer.
 * @returns {Promise<SaveOffer>} A promise that resolves to the updated save offer.
 * @throws {Error} If the request fails.
 */
export const updateSaveOffer = async (
  tenantId: string,
  updatedOffer: Partial<SaveOffer>,
): Promise<SaveOffer> => {
  try {
    if (!updatedOffer.id) {
      throw new Error('Offer ID is required for update');
    }
    const response = await fetch(
      `/api/tenants/${tenantId}/save-offers/${updatedOffer.id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedOffer),
      },
    );
    if (!response.ok) {
      throw new Error('Failed to update save offer');
    }
    return await response.json();
  } catch (error) {
    throw new Error('Error updating save offer: ' + (error as Error).message);
  }
};

/**
 * Sends a DELETE request to remove a save offer from a tenant.
 * @param {string} tenantId - The ID of the tenant.
 * @param {string} offerId - The ID of the offer to be deleted.
 * @returns {Promise<void>} A promise that resolves when the offer is deleted.
 * @throws {Error} If the request fails.
 */
export const deleteSaveOffer = async (
  tenantId: string,
  offerId: string,
): Promise<void> => {
  try {
    const response = await fetch(
      `/api/tenants/${tenantId}/save-offers/${offerId}`,
      {
        method: 'DELETE',
      },
    );
    if (!response.ok) {
      throw new Error('Failed to delete save offer');
    }
  } catch (error) {
    throw new Error('Error deleting save offer: ' + (error as Error).message);
  }
};

/**
 * Sends a GET request to fetch a tenant by ID.
 * @param {string} tenantId - The ID of the tenant.
 * @returns {Promise<Tenant>} A promise that resolves to the tenant.
 * @throws {Error} If the request fails.
 */
export async function getTenant(tenantId?: string): Promise<Tenant> {
  if (!tenantId) {
    throw new Error('No tenant id provided');
  }
  const response = await fetch(`/api/tenants/${tenantId}`, {
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch organization');
  }
  return response.json();
}

export const updateTenant = async (data: Tenant): Promise<Tenant | Error> => {
  const { id } = data;
  if (!id) {
    throw new Error('No tenant id provided');
  }
  const response = await fetch(`/api/tenants/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update organization');
  }
  return response.json();
};
