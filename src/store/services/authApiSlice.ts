import { apiSlice } from './apiSlice'
import { AUTH_URL } from '../constants'

import type { registerRequest, registerResponse, sentOtpRequest, sentOtpResponse, verifyOtpRequest, verifyOtpResponse } from '../../types/auth'

export interface RefreshTokenResponse {
    success: boolean;
    message: string;
    accessToken: string;
    refreshToken: string;
}

const authSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    register: builder.mutation<registerResponse, registerRequest>({
        query: (data) => ({
            url: `${AUTH_URL}/register`,
            method: 'POST',
            body: data,
        }),
    }),

    sendOTP: builder.mutation<sentOtpResponse, sentOtpRequest>({
        query: (data) => ({
            url: `${AUTH_URL}/send-otp`,
            method: 'POST',
            body: data,
        }),
    }),

    verifyOTP: builder.mutation<verifyOtpResponse, verifyOtpRequest>({
        query: (data) => ({
            url: `${AUTH_URL}/verify-otp`,
            method: 'POST',
            body: data,
        }),
        async onQueryStarted(arg, { queryFulfilled }) {
            try {
                const { data } = await queryFulfilled

                // Store tokens and user data in localStorage
                if (typeof window !== 'undefined') {
                    localStorage.setItem('accessToken', data.accessToken);
                    localStorage.setItem('refreshToken', data.refreshToken);
                    localStorage.setItem('user', JSON.stringify(data.user));
                }
            } catch (error) {

                // Clear any partial auth data on error
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('accessToken')
                    localStorage.removeItem('refreshToken')
                    localStorage.removeItem('user')
                }

                console.error('OTP verification failed:', error)
            }
        },
    }),

    refreshToken: builder.mutation<RefreshTokenResponse, void>({
      query: () => ({
        url: `${AUTH_URL}/refresh-token`,
        method: 'POST',
        headers: {
          // Include refresh token in request if available
          ...(typeof window !== 'undefined' && localStorage.getItem('refreshToken')
            ? { 'x-refresh-token': localStorage.getItem('refreshToken') || '' }
            : {}),
        },
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled

          // Update both tokens in localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
          }
        } catch (error) {

          // Handle error - clear all auth data if refresh fails
          if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('user')
          }

          console.error('Token refresh failed:', error)
        }
      },
    }),


    logout: builder.mutation<void, void>({
      query: () => ({
        url: `${AUTH_URL}/logout`,
        method: 'POST',
        headers: {
          ...(typeof window !== 'undefined' && localStorage.getItem('refreshToken')
            ? { 'x-refresh-token': localStorage.getItem('refreshToken') || '' }
            : {}),
        },
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled

          // Clear all auth data from localStorage
          if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
          }
        } catch (error) {

          // Even if logout fails, clear local data
          if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('user')
          }

          console.error('Logout failed:', error)
        }
      },
    }),
  
  }),
});

export const {
    useRegisterMutation,
    useSendOTPMutation,
    useVerifyOTPMutation,
    useRefreshTokenMutation,
    useLogoutMutation,
 } = authSlice;

