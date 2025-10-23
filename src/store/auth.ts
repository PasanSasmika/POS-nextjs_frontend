import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Interface representing the payload decoded directly from the JWT.
 * Should match the structure created in your NestJS AuthService getTokens method.
 */
interface DecodedJwtPayload {
    sub: number; // User ID is in the 'sub' field of the JWT standard
    username: string;
    role: string;
    fullName?: string; // Optional: if included in payload
    storeId?: number | null; // Optional: if included in payload
    // You might also have iat (issued at) and exp (expires) fields from jwtDecode
}

/**
 * Interface representing the user object as stored within the Zustand state.
 * We prefer using 'id' consistently within the frontend application state.
 */
interface StoredUserProfile {
    id: number; // Use 'id' for consistency in the store
    username: string;
    role: string;
    fullName?: string;
    storeId?: number | null;
}

/**
 * Interface defining the overall authentication state managed by Zustand.
 */
interface AuthState {
  token: string | null; // Stores the JWT access token
  user: StoredUserProfile | null; // Stores the user profile using our internal structure
  // setAuth now explicitly accepts the decoded JWT payload type
  setAuth: (token: string, decodedPayload: DecodedJwtPayload) => void;
  logout: () => void; // Action to clear authentication state
}

/**
 * Zustand store definition for authentication state.
 * Includes persistence to localStorage.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      token: null,
      user: null,

      /**
       * Action to update the state upon successful login.
       * Maps the 'sub' field from JWT payload to 'id' for internal state.
       */
      setAuth: (token, decodedPayload) => {
        console.log("Setting auth state with decoded payload:", decodedPayload); // Debug log
        set({
          token,
          user: {
            id: decodedPayload.sub, // <-- Perform the mapping here
            username: decodedPayload.username,
            role: decodedPayload.role,
            fullName: decodedPayload.fullName, // Pass through optional fields
            storeId: decodedPayload.storeId,   // Pass through optional fields
          }
        });
      },

      /**
       * Action to clear the authentication state upon logout.
       */
      logout: () => {
        console.log("Clearing auth state (logout)"); // Debug log
        set({ token: null, user: null });
        // Optionally clear other related storage if needed
      }
    }),
    {
      name: 'auth-storage', // Key used for storing state in localStorage
    }
  )
);