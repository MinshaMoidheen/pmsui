import { apiSlice } from './apiSlice'
import { JOBS_URL } from '../constants'
import { applyJobResponse, createJobPostRequest, createJobPostResponse, EmploymentType, getJobByIdResponse, getJobsResponse, JobStatus } from '@/types/job'

export interface GetJobsParams {
  city?: string 
  state?: string
  employmentType?: EmploymentType
  status?: JobStatus
  search?: string
  page?: number
  limit?: number
}

const jobsApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({

    getJobPosts: builder.query<getJobsResponse, GetJobsParams | void>({
      query: (params) => {
        const p: GetJobsParams = params ?? {}
        const { city,state, employmentType, status, search, page = 1, limit = 10 } = p
        return {
          url: `${JOBS_URL}`,
          method: 'GET',
          params: { city,state, employmentType, status, search, page, limit }
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

    applyJob: builder.mutation<applyJobResponse, { id: string}>({
      query: id => ({
        url: `${JOBS_URL}/${id}/apply`,
        method: "POST",
      }),
      invalidatesTags: [{type: 'Jobs', id: 'LIST'}]
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

 } = jobsApiSlice
