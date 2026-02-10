import { apiSlice } from './apiSlice'
import { SUBSCRIPTIONS_URL } from '../constants'
import type {
  GetPlansResponse,
  GetUserSubscriptionResponse,
  GetSubscriptionsResponse,
  GetSubscriptionByIdResponse,
  GetUserSubscriptionsParams,
  GetAllSubscriptionsParams,
  CreateSubscriptionRequest,
  CreateSubscriptionResponse,
  ActivateSubscriptionRequest,
  CancelSubscriptionRequest
} from '@/types/subscription'

const subscriptionsApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getSubscriptionPlans: builder.query<GetPlansResponse, void>({
      query: () => ({
        url: `${SUBSCRIPTIONS_URL}/plans`,
        method: 'GET'
      }),
      providesTags: [{ type: 'Subscriptions', id: 'PLANS' }]
    }),

    getUserSubscription: builder.query<GetUserSubscriptionResponse, void>({
      query: () => ({
        url: SUBSCRIPTIONS_URL,
        method: 'GET'
      }),
      providesTags: [{ type: 'Subscriptions', id: 'CURRENT' }]
    }),

    getUserSubscriptions: builder.query<GetSubscriptionsResponse, GetUserSubscriptionsParams | void>({
      query: params => {
        const p = params ?? {}
        const { status, page = 1, limit = 10 } = p
        return {
          url: `${SUBSCRIPTIONS_URL}/my`,
          method: 'GET',
          params: { status, page, limit }
        }
      },
      providesTags: result =>
        result?.data?.subscriptions
          ? [
              ...result.data.subscriptions.map(({ _id }) => ({ type: 'Subscriptions' as const, id: _id })),
              { type: 'Subscriptions', id: 'MY_LIST' }
            ]
          : [{ type: 'Subscriptions', id: 'MY_LIST' }]
    }),

    getAllSubscriptions: builder.query<GetSubscriptionsResponse, GetAllSubscriptionsParams | void>({
      query: params => {
        const p = params ?? {}
        const { status, subscriptionType, page = 1, limit = 10 } = p
        return {
          url: `${SUBSCRIPTIONS_URL}/all`,
          method: 'GET',
          params: { status, subscriptionType, page, limit }
        }
      },
      providesTags: result =>
        result?.data?.subscriptions
          ? [
              ...result.data.subscriptions.map(({ _id }) => ({ type: 'Subscriptions' as const, id: _id })),
              { type: 'Subscriptions', id: 'ALL_LIST' }
            ]
          : [{ type: 'Subscriptions', id: 'ALL_LIST' }]
    }),

    getSubscriptionById: builder.query<GetSubscriptionByIdResponse, string>({
      query: id => ({
        url: `${SUBSCRIPTIONS_URL}/${id}`,
        method: 'GET'
      }),
      providesTags: (_, __, id) => [{ type: 'Subscriptions', id }]
    }),

    createSubscription: builder.mutation<CreateSubscriptionResponse, CreateSubscriptionRequest>({
      query: body => ({
        url: SUBSCRIPTIONS_URL,
        method: 'POST',
        body
      }),
      invalidatesTags: [
        { type: 'Subscriptions', id: 'CURRENT' },
        { type: 'Subscriptions', id: 'MY_LIST' },
        { type: 'Subscriptions', id: 'ALL_LIST' }
      ]
    }),

    activateSubscription: builder.mutation<{ success: boolean; data?: { subscription: unknown }; message?: string }, ActivateSubscriptionRequest>({
      query: body => ({
        url: `${SUBSCRIPTIONS_URL}/activate`,
        method: 'POST',
        body
      }),
      invalidatesTags: [
        { type: 'Subscriptions', id: 'CURRENT' },
        { type: 'Subscriptions', id: 'MY_LIST' },
        { type: 'Subscriptions', id: 'ALL_LIST' }
      ]
    }),

    cancelSubscription: builder.mutation<{ success: boolean; data?: { subscription: unknown }; message?: string }, CancelSubscriptionRequest>({
      query: body => ({
        url: `${SUBSCRIPTIONS_URL}/cancel`,
        method: 'POST',
        body
      }),
      invalidatesTags: [
        { type: 'Subscriptions', id: 'CURRENT' },
        { type: 'Subscriptions', id: 'MY_LIST' },
        { type: 'Subscriptions', id: 'ALL_LIST' }
      ]
    })
  })
})

export const {
  useGetSubscriptionPlansQuery,
  useGetUserSubscriptionQuery,
  useGetUserSubscriptionsQuery,
  useGetAllSubscriptionsQuery,
  useGetSubscriptionByIdQuery,
  useCreateSubscriptionMutation,
  useActivateSubscriptionMutation,
  useCancelSubscriptionMutation
} = subscriptionsApiSlice
