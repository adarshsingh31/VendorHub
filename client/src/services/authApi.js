/**
 * authApi.js — Auth API helpers for the public auth pages.
 *
 * Uses the shared axiosInstance so every request automatically carries the
 * Bearer token and handles 401 redirects.
 */
import api from './axiosInstance'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const authApi = {
  /**
   * POST /api/auth/register
   * payload: { fullName, email, password, role }
   */
  register: async (payload) => {
    const { data } = await api.post('/api/auth/register', payload)
    return data
  },

  /**
   * POST /api/auth/login
   * payload: { email, password }
   * Returns: { token, user }
   */
  login: async (payload) => {
    const { data } = await api.post('/api/auth/login', payload)
    return data
  },

  /**
   * Returns the Google OAuth redirect URL.
   */
  googleAuthUrl: () => `${API_BASE}/api/auth/google`,

  /**
   * POST /api/auth/forgot-password
   * payload: { email }
   */
  forgotPassword: async (payload) => {
    const { data } = await api.post('/api/auth/forgot-password', payload)
    return data
  },

  /**
   * POST /api/auth/reset-password/:token
   * payload: { password }
   */
  resetPassword: async (token, payload) => {
    const { data } = await api.post(`/api/auth/reset-password/${token}`, payload)
    return data
  },
}
