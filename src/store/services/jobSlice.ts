import { apiSlice } from './apiSlice'
import { JOBS_URL } from '../constants'
import {
  applyJobResponse,
  createJobPostRequest,
  createJobPostResponse,
  EmploymentType,
  getJobByIdResponse,
  getJobsResponse,
  RequestEmployerAccessRequest,
  RequestEmployerAccessResponse,
  GetApplicationsResponse,
  UpdateApplicationStatusRequest,
  CreateApplicationRequest
} from '@/types/job'
import {
  createInterviewScheduleRequest,
  createInterViewScheduleResponse,
  getInterviewByIdResponse,
  GetInterviewsResponse,
  InterviewStatus
} from '@/types/interviewSchedule'

export interface GetJobsParams {
  city?: string
  state?: string
  employmentType?: EmploymentType
  experience?: string
  salary?: string
  education?: string
  jobLevel?: string
  search?: string
  page?: number
  limit?: number
}

export interface GetInterViewParams {
  jobId?: string
  applicantId?: string
  status?: InterviewStatus
  page?: number
  limit?: number
}

const jobsApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getJobPosts: builder.query<getJobsResponse, GetJobsParams | void>({
      query: params => {
        const p: GetJobsParams = params ?? {}
        const { city, state, employmentType, experience, salary, education, jobLevel, search, page = 1, limit = 10 } = p
        return {
          url: `${JOBS_URL}`,
          method: 'GET',
          params: { city, state, employmentType, experience, salary, education, jobLevel, search, page, limit }
        }
      },
      providesTags: result =>
        result?.data?.jobs
          ? [...result.data.jobs.map(({ _id }) => ({ type: 'Jobs' as const, id: _id })), { type: 'Jobs', id: 'LIST' }]
          : [{ type: 'Jobs', id: 'LIST' }]
    }),

    getJobById: builder.query<getJobByIdResponse, string>({
      query: id => ({
        url: `${JOBS_URL}/${id}`,
        method: 'GET'
      }),
      providesTags: (_, __, id) => [{ type: 'Jobs', id }]
    }),

    createJobPost: builder.mutation<createJobPostResponse, createJobPostRequest>({
      query: data => ({
        url: `${JOBS_URL}`,
        method: 'POST',
        body: data
      }),
      invalidatesTags: [{ type: 'Jobs', id: 'LIST' }]
    }),

    updateJobPost: builder.mutation<createJobPostResponse, { id: string; data: createJobPostRequest }>({
      query: ({ id, data }) => ({
        url: `${JOBS_URL}/${id}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: 'Jobs', id },
        { type: 'Jobs', id: 'LIST' }
      ]
    }),

    deleteJobPost: builder.mutation<{ success: boolean; message: string }, string>({
      query: id => ({
        url: `${JOBS_URL}/${id}/delete`,
        method: 'PATCH'
      }),
      invalidatesTags: (_, __, id) => [
        { type: 'Jobs', id },
        { type: 'Jobs', id: 'LIST' }
      ]
    }),

    applyJob: builder.mutation<applyJobResponse, CreateApplicationRequest>({
      query: ({ id, coverLetter, notes, applicantId }) => {
        const body: { coverLetter?: string; notes?: string; applicantId?: string } = {}
        if (coverLetter && coverLetter.trim()) {
          body.coverLetter = coverLetter.trim()
        }
        if (notes && notes.trim()) {
          body.notes = notes.trim()
        }
        if (applicantId && applicantId.trim()) {
          body.applicantId = applicantId.trim()
        }

        return {
          url: `${JOBS_URL}/${id}/apply`,
          method: 'POST',
          body
        }
      },
      invalidatesTags: [{ type: 'Jobs', id: 'LIST' }]
    }),

    requestEmployerAccess: builder.mutation<RequestEmployerAccessResponse, RequestEmployerAccessRequest>({
      query: body => ({
        url: `${JOBS_URL}/employer/request`,
        method: 'POST',
        body
      })
    }),

    getJobApplications: builder.query<
      GetApplicationsResponse,
      { jobId: string; status?: string; page?: number; limit?: number }
    >({
      query: ({ jobId, status, page = 1, limit = 10 }) => ({
        url: `${JOBS_URL}/${jobId}/applications`,
        method: 'GET',
        params: { status, page, limit }
      }),
      providesTags: result =>
        result?.data?.applications
          ? [
              ...result.data.applications.map(({ _id }) => ({ type: 'Jobs' as const, id: `app-${_id}` })),
              { type: 'Jobs', id: 'APPLICATIONS' }
            ]
          : [{ type: 'Jobs', id: 'APPLICATIONS' }]
    }),

    getMyJobApplications: builder.query<
      GetApplicationsResponse,
      { status?: string; page?: number; limit?: number } | void
    >({
      query: params => {
        const p = params ?? {}
        const { status, page = 1, limit = 10 } = p
        return {
          url: `${JOBS_URL}/applications/my`,
          method: 'GET',
          params: { status, page, limit }
        }
      },
      providesTags: result =>
        result?.data?.applications
          ? [
              ...result.data.applications.map(({ _id }) => ({ type: 'Jobs' as const, id: `my-app-${_id}` })),
              { type: 'Jobs', id: 'MY_APPLICATIONS' }
            ]
          : [{ type: 'Jobs', id: 'MY_APPLICATIONS' }]
    }),

    updateApplicationStatus: builder.mutation<
      GetApplicationsResponse['data']['applications'][number],
      { id: string; data: UpdateApplicationStatusRequest }
    >({
      query: ({ id, data }) => ({
        url: `${JOBS_URL}/applications/${id}/status`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: [
        { type: 'Jobs', id: 'APPLICATIONS' },
        { type: 'Jobs', id: 'MY_APPLICATIONS' }
      ]
    }),

    createInterviewSchedule: builder.mutation<createInterViewScheduleResponse, createInterviewScheduleRequest>({
      query: data => ({
        url: `${JOBS_URL}/interview/schedule`,
        method: 'POST',
        body: data
      }),
      invalidatesTags: [{ type: 'InterviewSchedules', id: 'LIST' }]
    }),

    getInterviews: builder.query<GetInterviewsResponse, GetInterViewParams | void>({
      query: params => {
        const p: GetInterViewParams = params ?? {}
        const { jobId, applicantId, status, page = 1, limit = 20 } = p
        return {
          url: `${JOBS_URL}/interviews`,
          method: 'GET',
          params: { jobId, applicantId, status, page, limit }
        }
      },
      providesTags: result =>
        result?.data?.interviews
          ? [
              ...result.data.interviews.map(({ _id }) => ({ type: 'InterviewSchedules' as const, id: _id })),
              { type: 'InterviewSchedules', id: 'LIST' }
            ]
          : [{ type: 'InterviewSchedules', id: 'LIST' }]
    }),

    getInterviewById: builder.query<getInterviewByIdResponse, string>({
      query: id => ({
        url: `${JOBS_URL}/interviews/${id}`,
        method: 'GET'
      }),
      providesTags: (_, __, id) => [{ type: 'InterviewSchedules', id }]
    }),

    updateInterview: builder.mutation<
      createInterViewScheduleResponse,
      { id: string; data: createInterviewScheduleRequest }
    >({
      query: ({ id, data }) => ({
        url: `${JOBS_URL}/interviews/${id}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: 'InterviewSchedules', id },
        { type: 'InterviewSchedules', id: 'LIST' }
      ]
    }),

    deleteInterview: builder.mutation<{ success: boolean; message: string }, string>({
      query: id => ({
        url: `${JOBS_URL}/interviews/${id}/delete`,
        method: 'PATCH'
      }),
      invalidatesTags: (_, __, id) => [
        { type: 'InterviewSchedules', id },
        { type: 'InterviewSchedules', id: 'LIST' }
      ]
    })
  })
})

export const {
  useGetJobPostsQuery,
  useGetJobByIdQuery,
  useCreateJobPostMutation,
  useUpdateJobPostMutation,
  useDeleteJobPostMutation,
  useApplyJobMutation,
  useRequestEmployerAccessMutation,
  useGetJobApplicationsQuery,
  useGetMyJobApplicationsQuery,
  useUpdateApplicationStatusMutation,
  useCreateInterviewScheduleMutation,
  useGetInterviewsQuery,
  useGetInterviewByIdQuery,
  useUpdateInterviewMutation,
  useDeleteInterviewMutation
} = jobsApiSlice
