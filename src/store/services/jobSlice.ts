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

export interface GetJobsParams {
  city?: string 
  state?: string
  employmentType?: EmploymentType
  search?: string
  page?: number
  limit?: number
}

const jobsApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({

    getJobPosts: builder.query<getJobsResponse, GetJobsParams | void>({
      query: (params) => {
        const p: GetJobsParams = params ?? {}
        const { city,state, employmentType, search, page = 1, limit = 10 } = p
        return {
          url: `${JOBS_URL}`,
          method: 'GET',
          params: { city,state, employmentType, search, page, limit }
        }
      },
      providesTags: result =>
        result?.data?.jobs
          ? [
              ...result.data.jobs.map(({ _id }) => ({ type: 'Jobs' as const, id: _id })),
              { type: 'Jobs', id: 'LIST' }
            ]
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
        method: "POST",
        body: data
      }),
      invalidatesTags: [{type: 'Jobs', id: 'LIST'}]
    }),

    updateJobPost: builder.mutation<createJobPostResponse, { id: string; data: createJobPostRequest }>({
      query: ({ id, data }) => ({
        url: `${JOBS_URL}/${id}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'Jobs', id }, { type: 'Jobs', id: 'LIST' }]
    }),

    deleteJobPost: builder.mutation<{ success: boolean; message: string }, string>({
      query: id => ({
        url: `${JOBS_URL}/${id}/delete`,
        method: 'PATCH'
      }),
      invalidatesTags: (_, __, id) => [{ type: 'Jobs', id }, { type: 'Jobs', id: 'LIST' }]
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
      invalidatesTags: [{type: 'Jobs', id: 'LIST'}]
    }),

    requestEmployerAccess: builder.mutation<RequestEmployerAccessResponse, RequestEmployerAccessRequest>({
      query: body => ({
        url: `${JOBS_URL}/employer/request`,
        method: 'POST',
        body
      })
    }),

    getJobApplications: builder.query<GetApplicationsResponse, { jobId: string; status?: string; page?: number; limit?: number }>({
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

    getMyJobApplications: builder.query<GetApplicationsResponse, { status?: string; page?: number; limit?: number } | void>({
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

    updateApplicationStatus: builder.mutation<GetApplicationsResponse['data']['applications'][number], { id: string; data: UpdateApplicationStatusRequest }>({
      query: ({ id, data }) => ({
        url: `${JOBS_URL}/applications/${id}/status`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: [{ type: 'Jobs', id: 'APPLICATIONS' }, { type: 'Jobs', id: 'MY_APPLICATIONS' }]
    }),



// router.get('/:jobId/applications', authenticate, validateRequest(GetApplicationsQuerySchema), getApplications);
// router.put('/applications/:id/status', authenticate, validateRequest(UpdateApplicationStatusSchema), updateApplicationStatus);


// router.post('/interview/schedule', authenticate, requireSuperAdmin, validateRequest(CreateInterviewScheduleSchema), createInterviewSchedule);


// router.get('/interviews', authenticate, validateRequest(GetInterviewsQuerySchema), getInterviews);


// router.get('/interviews/:id', authenticate, getInterviewById);


// router.put('/interviews/:id', authenticate, requireSuperAdmin, validateRequest(UpdateInterviewSchema), updateInterview);


// router.patch('/interviews/:id/delete', authenticate, requireSuperAdmin, deleteInterview);

   
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
  useUpdateApplicationStatusMutation
} = jobsApiSlice
