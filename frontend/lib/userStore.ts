import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface UserProfile {
  id?: number;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  role?: 'customer' | 'tenant_admin' | 'super_admin' | 'admin';
  tenant_id?: number | null;
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

interface UserStore {
  profile: UserProfile | null;
  isLoggedIn: boolean;
  _hasHydrated: boolean;
  setProfile: (profile: UserProfile) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  clearProfile: () => void;
  login: (profile: UserProfile) => void;
  logout: () => void;
  setHasHydrated: (state: boolean) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      profile: null,
      isLoggedIn: false,
      _hasHydrated: false,

      setHasHydrated: (state) => set({ _hasHydrated: state }),

      setProfile: (profile) => {
        set({ profile, isLoggedIn: true });
      },

      updateProfile: (updates) => {
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...updates } : null,
        }));
      },

      clearProfile: () => {
        set({ profile: null, isLoggedIn: false });
      },

      login: (profile) => {
        set({ profile, isLoggedIn: true });
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
        }
        set({ profile: null, isLoggedIn: false });
      },
    }),
    {
      name: 'zeina-user',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);