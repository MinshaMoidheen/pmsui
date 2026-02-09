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
import Typography from '@mui/material/Typography'

// Store Imports
import { useApplyJobMutation, useGetJobByIdQuery } from '@/store/services/jobSlice'

interface JobApplyFormProps {
  id: string
}

const JobApplyForm = ({ id }: JobApplyFormProps) => {
  const router = useRouter()
  const [applyJob, { isLoading }] = useApplyJobMutation()
  const { data: jobData, isLoading: isLoadingJob } = useGetJobByIdQuery(id)

  const [coverLetter, setCoverLetter] = useState('')
  const [error, setError] = useState('')

  const job = jobData?.data?.job
  const jobTitle = job?.title ?? 'Job'

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      await applyJob({ id, coverLetter: coverLetter || undefined }).unwrap()
      router.push('/jobs/applications/my')
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'data' in err
          ? (err.data as { message?: string })?.message ?? 'Failed to apply for job'
          : 'Failed to apply for job'
      setError(message)
    }
  }

  if (isLoadingJob && !job) {
    return (
      <div className='flex justify-center p-8'>
        <CircularProgress />
      </div>
    )
  }

  return (
    <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
      <CardHeader
        title='Apply for Job'
        subheader={jobTitle}
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
            <Grid item xs={12} sx={{ display: 'flex', gap: 1.5, mt: 1 }}>
              <Button variant='contained' type='submit' disabled={isLoading} size='small'>
                {isLoading ? <CircularProgress size={20} /> : 'Apply'}
              </Button>
              <Button variant='outlined' onClick={() => router.push('/jobs')} size='small'>
                Cancel
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default JobApplyForm

