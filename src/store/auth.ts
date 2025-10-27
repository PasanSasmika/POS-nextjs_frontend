import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DecodedJwtPayload {
    sub: number; 
    username: string;
    role: string;
    fullName?: string; 
    storeId?: number | null; 
}

interface StoredUserProfile {
    id: number; 
    username: string;
    role: string;
    fullName?: string;
    storeId?: number | null;
}


interface AuthState {
  token: string | null; 
  user: StoredUserProfile | null; 
  setAuth: (token: string, decodedPayload: DecodedJwtPayload) => void;
  logout: () => void; 
}


export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,

      setAuth: (token, decodedPayload) => {
        console.log("Setting auth state with decoded payload:", decodedPayload); 
        set({
          token,
          user: {
            id: decodedPayload.sub, 
            username: decodedPayload.username,
            role: decodedPayload.role,
            fullName: decodedPayload.fullName, 
            storeId: decodedPayload.storeId,   
          }
        });
      },

     
      logout: () => {
        console.log("Clearing auth state (logout)"); 
        set({ token: null, user: null });
      }
    }),
    {
      name: 'auth-storage', 
    }
  )
);