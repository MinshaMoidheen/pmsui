import { apiSlice } from './apiSlice'
import { REVIEWS_URL } from '../constants'
import { updateReviewResponse, ReviewTargetType, getAllReviewsResponse } from '@/types/reviews'

export interface GetReviewsParams {
  targetType?: ReviewTargetType
  search?: string
  page?: number
  limit?: number
}

const reviewsApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    
    getAllReviews: builder.query<getAllReviewsResponse, GetReviewsParams | void>({
      query: params => {
        const p: GetReviewsParams = params ?? {}
        const { targetType, search, page = 1, limit = 10 } = p
        return {
          url: `${REVIEWS_URL}`,
          method: 'GET',
          params: { targetType, search, page, limit }
        }
      },
      providesTags: result =>
        result?.data?.reviews
          ? [
              ...result.data.reviews.map(({ _id }) => ({ type: 'Reviews' as const, id: _id })),
              { type: 'Reviews', id: 'LIST' }
            ]
          : [{ type: 'Reviews', id: 'LIST' }]
    }),

    updateReview: builder.mutation<updateReviewResponse, { reviewId: string; rating: number; comment: string }>({
      query: ({ reviewId, rating, comment }) => ({
        url: `${REVIEWS_URL}/${reviewId}`,
        method: 'PUT',
        body: { rating, comment }
      }),
      invalidatesTags: [{ type: 'Reviews', id: 'LIST' }]
    }),

    deleteReview: builder.mutation<{ success: boolean; message: string }, { reviewId: string }>({
      query: ({ reviewId }) => ({
        url: `${REVIEWS_URL}/${reviewId}`,
        method: 'DELETE'
      }),
      invalidatesTags: [{ type: 'Reviews', id: 'LIST' }]
    })
  })
})

export const { useGetAllReviewsQuery, useUpdateReviewMutation, useDeleteReviewMutation } = reviewsApiSlice
