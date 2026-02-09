import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query'

import { BASE_URL, AUTH_URL } from '../constants'

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: 'include',
  prepareHeaders: headers => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken')

      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
    }

    return headers
  },

  fetchFn: async (input, init) => {
    if (init?.body instanceof FormData) {
      if (init.headers) {
        const headers = new Headers(init.headers)

        headers.delete('Content-Type')
        init.headers = headers
      }
    }

    return fetch(input, init)
  }
})

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  let result = await baseQuery(args, api, extraOptions)

  // Check if the response is 401 (Unauthorized)
  if (result.error && result.error.status === 401) {
    // Try to refresh the token
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null

    if (refreshToken) {
      try {
        // Attempt to refresh the token
        const refreshResult = await baseQuery(
          {
            url: `${AUTH_URL}/refresh-token`,
            method: 'POST',
            headers: {
              'x-refresh-token': refreshToken
            }
          },
          api,
          extraOptions
        )

        if (refreshResult.data) {
          const refreshData = refreshResult.data as {
            accessToken: string
            refreshToken: string
            success?: boolean
          }

          // Store new tokens
          if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', refreshData.accessToken)
            localStorage.setItem('refreshToken', refreshData.refreshToken)
          }

          // Retry the original request with the new token
          result = await baseQuery(args, api, extraOptions)
        } else {
          // Refresh failed, clear auth data
          throw new Error('Token refresh failed')
        }
      } catch (error) {
        // Refresh failed, clear all auth data
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')

          // Dispatch custom event to notify auth context
          window.dispatchEvent(new CustomEvent('tokenExpired'))

          // Show notification to user
          window.dispatchEvent(
            new CustomEvent('showToast', {
              detail: {
                title: 'Session Expired',
                description: 'Your session has expired. Please log in again.',
                variant: 'destructive'
              }
            })
          )

          // Redirect to login page using replace to avoid history issues
          if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
            window.location.replace('/login')
          }
        }
      }
    } else {
      // No refresh token available, clear auth data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')

        // Dispatch custom event to notify auth context
        window.dispatchEvent(new CustomEvent('tokenExpired'))

        // Show notification to user
        window.dispatchEvent(
          new CustomEvent('showToast', {
            detail: {
              title: 'Session Expired',
              description: 'Your session has expired. Please log in again.',
              variant: 'destructive'
            }
          })
        )

        // Redirect to login page using replace to avoid history issues
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.replace('/login')
        }
      }
    }
  }

  return result
}

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Accounts', 'Properties', 'Jobs'],
  endpoints: () => ({})
})

export type { BaseQueryFn } from '@reduxjs/toolkit/query'
