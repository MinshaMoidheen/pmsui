import { apiSlice } from './apiSlice'
import { ADS_URL } from '../constants'
import {
  AdRequestStatus,
  AdType,
  CreateAdRequestRequest,
  CreateAdRequestResponse,
  getAdRequestsResponse
} from '@/types/ads'

const adsApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    createAdRequest: builder.mutation<CreateAdRequestResponse, CreateAdRequestRequest>({
      query: data => ({
        url: `${ADS_URL}`,
        method: 'POST',
        body: data
      }),
      invalidatesTags: [{ type: 'Ads', id: 'LIST' }]
    }),

    getAdRequests: builder.query<
      getAdRequestsResponse,
      { adType?: AdType; status?: AdRequestStatus; page: number; limit: number }
    >({
      query: ({ adType, status, page = 1, limit = 10 }) => ({
        url: `${ADS_URL}`,
        method: 'GET',
        params: { adType, status, page, limit }
      }),
      providesTags: [{ type: 'Ads', id: 'LIST' }]
    }),

    updateAdRequestStatus: builder.mutation<CreateAdRequestResponse, { id: string; status: AdRequestStatus }>({
      query: ({ id, status }) => ({
        url: `${ADS_URL}/${id}/status`,
        method: 'PATCH',
        body: { status }
      }),
      invalidatesTags: [{ type: 'Ads', id: 'LIST' }]
    })
  })
})

export const { useCreateAdRequestMutation, useGetAdRequestsQuery, useUpdateAdRequestStatusMutation } = adsApiSlice
