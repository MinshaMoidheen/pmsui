import { apiSlice } from './apiSlice'
import { USERS_URL } from '../constants'
import {
  GetUsersParams,
  GetUsersResponse,
  GetUserByIdResponse,
  CreateUserRequest,
  CreateUserResponse,
  UpdateUserRequest,
  UpdateUserResponse
} from '@/types/users'

const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getUsers: builder.query<GetUsersResponse, GetUsersParams | void>({
      query: params => {
        const p: GetUsersParams = params ?? {}
        const { role, search, isActive, page = 1, limit = 10 } = p

        return {
          url: `${USERS_URL}`,
          method: 'GET',
          params: { role, search, isActive, page, limit }
        }
      },
      providesTags: result =>
        result?.data?.users
          ? [
              ...result.data.users.map(({ _id }) => ({ type: 'Users' as const, id: _id })),
              { type: 'Users', id: 'LIST' }
            ]
          : [{ type: 'Users', id: 'LIST' }]
    }),

    getUserById: builder.query<GetUserByIdResponse, string>({
      query: id => ({
        url: `${USERS_URL}/${id}`,
        method: 'GET'
      }),
      providesTags: (_, __, id) => [{ type: 'Users', id }]
    }),

    createUser: builder.mutation<CreateUserResponse, CreateUserRequest>({
      query: data => ({
        url: `${USERS_URL}`,
        method: 'POST',
        body: data
      }),
      invalidatesTags: [{ type: 'Users', id: 'LIST' }]
    }),

    updateUser: builder.mutation<UpdateUserResponse, { id: string; data: UpdateUserRequest }>({
      query: ({ id, data }) => ({
        url: `${USERS_URL}/${id}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'Users', id }, { type: 'Users', id: 'LIST' }]
    }),

    deleteUser: builder.mutation<{ success: boolean; message: string }, string>({
      query: id => ({
        url: `${USERS_URL}/${id}/delete`,
        method: 'PATCH'
      }),
      invalidatesTags: (_, __, id) => [{ type: 'Users', id }, { type: 'Users', id: 'LIST' }]
    })
  })
})

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation
} = usersApiSlice

