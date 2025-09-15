import { create } from 'zustand'

import toast from 'react-hot-toast'

import { axiosInstance } from '../lib/axios.js'

export const useAuthStore = create(set => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get('/auth/me')

      set({
        authUser: res.data,
        isCheckingAuth: false,
      })
    } catch {
      set({
        authUser: null,
      })
    } finally {
      set({
        isCheckingAuth: false,
      })
    }
  },
  signUp: async (data) => {
    try {
      const res = await axiosInstance.post('/auth/signup', data)
      set({
        authUser: res.data,
      })

      toast.success('Sign up successful!')
    } catch (error) {
      toast.error(error?.response?.data?.message)
    } finally {
      set({ isSigningUp: false })
    }
  },
}))
