import localforage from 'localforage';
import api from './api'; // Import your configured Axios instance
import { useAuthStore } from '@/store/auth'; // To get the auth token

// Define a key for our offline sales
const PENDING_SALES_KEY = 'pending_sales';

// Configure localforage
localforage.config({
  name: 'posOfflineDB',
  storeName: 'sales',
});

/**
 * Saves a single sale object to the pending list in local storage.
 * @param saleData The sale data payload (what you would send to /api/sales).
 */
export const saveSaleForSync = async (saleData: any) => {
  try {
    const pendingSales = (await localforage.getItem<any[]>(PENDING_SALES_KEY)) || [];
    pendingSales.push({
      ...saleData,
      id: `offline_${new Date().toISOString()}`, // Give it a temporary unique ID
    });
    await localforage.setItem(PENDING_SALES_KEY, pendingSales);
    console.log('Sale saved locally:', saleData);
  } catch (error) {
    console.error('Error saving sale locally:', error);
  }
};

/**
 * Attempts to sync all pending sales to the backend API.
 * @returns {Promise<boolean>} True if sync was successful (or nothing to sync), false if sync failed.
 */
export const syncPendingSales = async (): Promise<boolean> => {
  let pendingSales = (await localforage.getItem<any[]>(PENDING_SALES_KEY)) || [];
  
  if (pendingSales.length === 0) {
    console.log('No pending sales to sync.');
    return true; // Nothing to sync
  }

  // Check if user is authenticated (token is required for API call)
  const token = useAuthStore.getState().token;
  if (!token) {
    console.warn('Cannot sync: User is not authenticated.');
    return false; // Cannot sync without a token
  }

  console.log(`Attempting to sync ${pendingSales.length} pending sale(s)...`);
  
  let syncFailed = false;

  // We process sales one by one
  while (pendingSales.length > 0) {
    const saleToSync = pendingSales[0]; // Get the oldest sale
    
    try {
      // Remove the temporary offline ID before sending
      const { id, ...saleData } = saleToSync; 
      
      console.log('Syncing sale:', saleData);
      await api.post('/sales', saleData, {
        headers: {
          Authorization: `Bearer ${token}`, // Ensure token is attached
        },
      });

      // Success! Remove it from the *start* of the array.
      pendingSales.shift();
      await localforage.setItem(PENDING_SALES_KEY, pendingSales);
      console.log('Successfully synced sale. Remaining:', pendingSales.length);

    } catch (error) {
      console.error('Failed to sync one sale:', error);
      // Stop syncing if one fails (to maintain order)
      // The backend might be down, or this sale is invalid
      syncFailed = true;
      break; 
    }
  }

  return !syncFailed; // Return true if all sales were synced
};

/**
 * Gets the current number of pending sales.
 */
export const getPendingSalesCount = async (): Promise<number> => {
    const pendingSales = (await localforage.getItem<any[]>(PENDING_SALES_KEY)) || [];
    return pendingSales.length;
};