import { create } from 'zustand'

export const useAuthStore = create(set => ({
  authUser: null,
  isLoading: false,
  isLoggedIn: false,
  login: () => {
    set({
      isLoading: true,
      isLoggedIn: true,
    })
  }
}))
