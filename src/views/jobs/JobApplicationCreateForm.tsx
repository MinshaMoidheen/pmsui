'use client'

// React Imports
import { useState } from 'react'
import type { FormEvent } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Grid from '@mui/material/Grid'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'

// Store Imports
import { useGetJobPostsQuery, useApplyJobMutation } from '@/store/services/jobSlice'
import { useGetUsersQuery } from '@/store/services/usersApiSlice'

// Auth
import { useAuth } from '@/contexts/AuthContext'

// Types
import type { GetJobsParams } from '@/store/services/jobSlice'
import type { IJobPost } from '@/types/job'
import type { IUser } from '@/types/users'

const JobApplicationCreateForm = () => {
  const router = useRouter()
  const { user } = useAuth()

  // Fetch first page of jobs for selection
  const jobParams: GetJobsParams = { page: 1, limit: 50 }
  const { data: jobsData, isLoading: isLoadingJobs } = useGetJobPostsQuery(jobParams)
  const jobs = jobsData?.data?.jobs ?? []

  // Fetch users for admin/broker selection (optional)
  const { data: usersData } = useGetUsersQuery({ page: 1, limit: 50 })
  const users = usersData?.data?.users ?? []

  const [applyJob, { isLoading }] = useApplyJobMutation()

  const [jobId, setJobId] = useState('')
  const [userId, setUserId] = useState(user?.id ?? '')
  const [coverLetter, setCoverLetter] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!jobId) {
      setError('Please select a job.')
      return
    }

    try {
      await applyJob({ id: jobId, coverLetter: coverLetter || undefined, notes: notes || undefined }).unwrap()
      router.push('/jobs/applications/my')
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'data' in err
          ? (err.data as { message?: string })?.message ?? 'Failed to create job application'
          : 'Failed to create job application'
      setError(message)
    }
  }

  const applicantName = user
    ? [user.profile.firstName, user.profile.lastName].filter(Boolean).join(' ') || user.mobileNumber
    : ''

  return (
    <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
      <CardHeader
        title='Create Job Application'
        sx={{ pb: 1, '& .MuiCardHeader-title': { fontSize: '1.25rem', fontWeight: 600 } }}
      />
      <CardContent sx={{ pt: 0, px: { xs: 3, sm: 4 }, pb: 4 }}>
        <form onSubmit={handleSubmit}>
          {error && (
            <Alert
              severity='error'
              onClose={() => setError('')}
              sx={{ mb: 2.5, py: 0.75, '& .MuiAlert-message': { fontSize: '0.875rem' } }}
            >
              {error}
            </Alert>
          )}

          <Grid container spacing={2.5}>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label='Job'
                value={jobId}
                onChange={e => setJobId(e.target.value)}
                disabled={isLoadingJobs}
              >
                {jobs.map((job: IJobPost) => (
                  <MenuItem key={job._id} value={job._id}>
                    {job.title} — {job.companyName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select={!!users.length}
                label='Applicant'
                value={userId || ''}
                onChange={e => setUserId(e.target.value)}
                disabled={!users.length}
                helperText={!users.length ? applicantName || 'Current user' : 'Select applicant (admin only)'}
              >
                {users.map((u: IUser) => (
                  <MenuItem key={u._id} value={u._id}>
                    {[u.profile?.firstName, u.profile?.lastName].filter(Boolean).join(' ') || u.mobileNumber || u._id}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 1.5 }}>
                Your application will be sent to the employer. You can contact them using WhatsApp or Call links after applying.
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={4}
                label='Cover Letter (optional)'
                value={coverLetter}
                onChange={e => setCoverLetter(e.target.value)}
                placeholder='Write a short note to the employer...'
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={2}
                label='Notes (optional)'
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder='Internal notes for this application...'
              />
            </Grid>

            <Grid item xs={12} sx={{ display: 'flex', gap: 1.5, mt: 1 }}>
              <Button variant='contained' type='submit' disabled={isLoading} size='small'>
                {isLoading ? <CircularProgress size={20} /> : 'Create'}
              </Button>
              <Button variant='outlined' onClick={() => router.push('/jobs/applications/my')} size='small'>
                Cancel
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default JobApplicationCreateForm

