'use client'

// React Imports
import { useEffect, useState } from 'react'
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
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'

// Store Imports
import { useCreateJobPostMutation, useUpdateJobPostMutation, useGetJobByIdQuery } from '@/store/services/jobSlice'

// Types & Schema
import type { createJobPostRequest } from '@/types/job'
import { EMPLOYMENT_TYPE_OPTIONS, EDUCATION_OPTIONS, JOB_LEVEL_OPTIONS, EXPERIENCE_OPTIONS } from '@/types/job'
import { jobFormSchema } from '@/schemas/jobSchema'

const inputSx = {
  '& .MuiInputBase-input': { py: 0.875, px: 1.25, fontSize: '0.9375rem', minHeight: 38 },
  '& .MuiInputLabel-root': { fontSize: '0.875rem', fontWeight: 500 },
  '& .MuiFormHelperText-root': { fontSize: '0.75rem', mt: 0.5 },
  '& .MuiOutlinedInput-root': { borderRadius: 1.25 }
}

const sectionSx = { mb: 3 }

interface JobFormProps {
  id?: string
}

const defaultFormValues: createJobPostRequest = {
  title: '',
  description: '',
  companyName: '',
  employmentType: 'FULL_TIME',
  experience: '',
  education: '',
  jobLevel: '',
  location: {
    city: '',
    state: '',
    address: ''
  },
  salary: {
    min: 0,
    max: 0,
    currency: 'INR',
    period: 'per month'
  },
  requirements: [],
  responsibilities: [],
  contact: {
    name: '',
    mobileNumber: '',
    email: '',
    whatsappNumber: ''
  }
}

const JobForm = ({ id }: JobFormProps) => {
  const router = useRouter()
  const isEdit = !!id

  const [formData, setFormData] = useState<createJobPostRequest>(defaultFormValues)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const { data: jobData, isLoading: isLoadingJob } = useGetJobByIdQuery(id!, { skip: !id })
  const [createJobPost, { isLoading: isCreating }] = useCreateJobPostMutation()
  const [updateJobPost, { isLoading: isUpdating }] = useUpdateJobPostMutation()

  const isLoading = isCreating || isUpdating

  useEffect(() => {
    const job = jobData?.data?.job
    if (job) {
      setFormData({
        title: job.title,
        description: job.description ?? '',
        companyName: job.companyName,
        employmentType: job.employmentType,
        experience: job.experience ?? '',
        education: job.education ?? '',
        jobLevel: job.jobLevel ?? '',
        location: {
          city: job.location?.city ?? '',
          state: job.location?.state ?? '',
          address: job.location?.address ?? ''
        },
        salary: job.salary
          ? {
              min: job.salary.min,
              max: job.salary.max,
              currency: job.salary.currency,
              period: job.salary.period
            }
          : {
              min: 0,
              max: 0,
              currency: 'INR',
              period: 'per month'
            },
        requirements: job.requirements ?? [],
        responsibilities: job.responsibilities ?? [],
        contact: {
          name: job.contact?.name ?? '',
          mobileNumber: job.contact?.mobileNumber ?? '',
          email: job.contact?.email ?? '',
          whatsappNumber: job.contact?.whatsappNumber ?? ''
        }
      })
    }
  }, [jobData])

  const updateField = (field: keyof createJobPostRequest, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (fieldErrors[field]) setFieldErrors(prev => ({ ...prev, [field]: '' }))
  }

  const updateLocation = (field: keyof createJobPostRequest['location'], value: string) => {
    setFormData(prev => ({
      ...prev,
      location: { ...prev.location, [field]: value }
    }))
    const key = `location.${field}`
    if (fieldErrors[key]) setFieldErrors(prev => ({ ...prev, [key]: '' }))
  }

  const updateSalary = (field: keyof NonNullable<createJobPostRequest['salary']>, value: number | string) => {
    setFormData(prev => ({
      ...prev,
      salary: {
        ...(prev.salary ?? { min: 0, max: 0, currency: 'INR', period: 'per month' }),
        [field]: field === 'min' || field === 'max' ? Number(value) : value
      }
    }))
  }

  const updateContact = (field: keyof createJobPostRequest['contact'], value: string) => {
    setFormData(prev => ({
      ...prev,
      contact: { ...prev.contact, [field]: value }
    }))
    const key = `contact.${field}`
    if (fieldErrors[key]) setFieldErrors(prev => ({ ...prev, [key]: '' }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    const result = jobFormSchema.safeParse({
      ...formData,
      contact: {
        ...formData.contact,
        email: formData.contact.email || ''
      },
      salary: formData.salary && (formData.salary.min || formData.salary.max) ? formData.salary : undefined
    })

    if (!result.success) {
      const errors: Record<string, string> = {}
      result.error.issues.forEach(issue => {
        const path = issue.path.join('.')
        if (!errors[path]) errors[path] = issue.message
      })
      setFieldErrors(errors)
      setError(result.error.issues[0]?.message ?? 'Please fix the errors below')
      return
    }

    const payload: createJobPostRequest = {
      title: result.data.title.trim(),
      description: result.data.description.trim(),
      companyName: result.data.companyName.trim(),
      employmentType: result.data.employmentType,
      experience: result.data.experience,
      education: result.data.education,
      jobLevel: result.data.jobLevel,
      location: result.data.location,
      salary: result.data.salary
        ? {
            min: result.data.salary.min ?? 0,
            max: result.data.salary.max ?? 0,
            currency: result.data.salary.currency ?? 'INR',
            period: result.data.salary.period ?? 'per month'
          }
        : undefined,
      requirements: result.data.requirements ?? [],
      responsibilities: result.data.responsibilities ?? [],
      contact: {
        name: result.data.contact.name.trim(),
        mobileNumber: result.data.contact.mobileNumber.trim(),
        email: result.data.contact.email?.trim() || undefined,
        whatsappNumber: result.data.contact.whatsappNumber.trim()
      }
    }

    try {
      if (isEdit && id) {
        await updateJobPost({ id, data: payload }).unwrap()
        router.push('/jobs')
      } else {
        await createJobPost(payload).unwrap()
        router.push('/jobs')
      }
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'data' in err
          ? ((err.data as { message?: string })?.message ?? 'Operation failed')
          : 'Operation failed'
      setError(message)
    }
  }

  const getError = (path: string) => fieldErrors[path] ?? ''

  if (isEdit && isLoadingJob) {
    return (
      <div className='flex justify-center p-8'>
        <CircularProgress />
      </div>
    )
  }

  return (
    <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
      <CardHeader
        title={isEdit ? 'Edit Job' : 'Create Job'}
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

          <Box component='div' sx={sectionSx}>
            <Typography
              variant='subtitle2'
              fontWeight={600}
              sx={{ mb: 1.5, pl: 1.5, borderLeft: 3, borderColor: 'primary.main' }}
              color='text.primary'
            >
              Job Details
            </Typography>
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='Job Title'
                  placeholder='e.g. Senior Software Engineer'
                  value={formData.title}
                  onChange={e => updateField('title', e.target.value)}
                  error={!!getError('title')}
                  helperText={getError('title')}
                  sx={inputSx}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='Company Name'
                  placeholder='Company'
                  value={formData.companyName}
                  onChange={e => updateField('companyName', e.target.value)}
                  error={!!getError('companyName')}
                  helperText={getError('companyName')}
                  sx={inputSx}
                />
              </Grid>
              <Grid item xs={4} md={3}>
                <TextField
                  fullWidth
                  select
                  label='Employment Type'
                  value={formData.employmentType}
                  onChange={e => updateField('employmentType', e.target.value)}
                  sx={inputSx}
                >
                  {EMPLOYMENT_TYPE_OPTIONS.map(et => (
                    <MenuItem key={et.value} value={et.value}>
                      {et.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={4} md={3}>
                <TextField
                  fullWidth
                  select
                  label='Experience'
                  value={formData.experience}
                  onChange={e => updateField('experience', e.target.value)}
                  error={!!getError('experience')}
                  helperText={getError('experience')}
                  sx={inputSx}
                >
                  <MenuItem value=''>Select Experience</MenuItem>
                  {EXPERIENCE_OPTIONS.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={4} md={3}>
                <TextField
                  fullWidth
                  select
                  label='Education'
                  value={formData.education}
                  onChange={e => updateField('education', e.target.value)}
                  error={!!getError('education')}
                  helperText={getError('education')}
                  sx={inputSx}
                >
                  <MenuItem value=''>Select Education</MenuItem>
                  {EDUCATION_OPTIONS.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={4} md={3}>
                <TextField
                  fullWidth
                  select
                  label='Job Level'
                  value={formData.jobLevel}
                  onChange={e => updateField('jobLevel', e.target.value)}
                  error={!!getError('jobLevel')}
                  helperText={getError('jobLevel')}
                  sx={inputSx}
                >
                  <MenuItem value=''>Select Job Level</MenuItem>
                  {JOB_LEVEL_OPTIONS.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label='Description'
                  placeholder='Job description...'
                  value={formData.description}
                  onChange={e => updateField('description', e.target.value)}
                  error={!!getError('description')}
                  helperText={getError('description')}
                  sx={inputSx}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 2.5 }} />

          <Box component='div' sx={sectionSx}>
            <Typography
              variant='subtitle2'
              fontWeight={600}
              sx={{ mb: 1.5, pl: 1.5, borderLeft: 3, borderColor: 'primary.main' }}
              color='text.primary'
            >
              Location
            </Typography>
            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Address'
                  placeholder='Street, locality'
                  value={formData.location.address ?? ''}
                  onChange={e => updateLocation('address', e.target.value)}
                  sx={inputSx}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='City'
                  placeholder='City'
                  value={formData.location.city}
                  onChange={e => updateLocation('city', e.target.value)}
                  error={!!getError('location.city')}
                  helperText={getError('location.city')}
                  sx={inputSx}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='State'
                  placeholder='State'
                  value={formData.location.state}
                  onChange={e => updateLocation('state', e.target.value)}
                  error={!!getError('location.state')}
                  helperText={getError('location.state')}
                  sx={inputSx}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 2.5 }} />

          <Box component='div' sx={sectionSx}>
            <Typography
              variant='subtitle2'
              fontWeight={600}
              sx={{ mb: 1.5, pl: 1.5, borderLeft: 3, borderColor: 'primary.main' }}
              color='text.primary'
            >
              Salary
            </Typography>
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type='number'
                  label='Min Salary'
                  value={formData.salary?.min ?? ''}
                  onChange={e => updateSalary('min', e.target.value)}
                  inputProps={{ min: 0 }}
                  sx={inputSx}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type='number'
                  label='Max Salary'
                  value={formData.salary?.max ?? ''}
                  onChange={e => updateSalary('max', e.target.value)}
                  inputProps={{ min: 0 }}
                  sx={inputSx}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label='Currency'
                  value={formData.salary?.currency ?? 'INR'}
                  onChange={e => updateSalary('currency', e.target.value)}
                  sx={inputSx}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label='Period'
                  value={formData.salary?.period ?? 'per month'}
                  onChange={e => updateSalary('period', e.target.value)}
                  sx={inputSx}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 2.5 }} />

          <Box component='div' sx={sectionSx}>
            <Typography
              variant='subtitle2'
              fontWeight={600}
              sx={{ mb: 1.5, pl: 1.5, borderLeft: 3, borderColor: 'primary.main' }}
              color='text.primary'
            >
              Requirements & Responsibilities
            </Typography>
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  label='Requirements (one per line)'
                  value={formData.requirements.join('\n')}
                  onChange={e =>
                    updateField(
                      'requirements',
                      e.target.value
                        .split('\n')
                        .map(line => line.trim())
                        .filter(Boolean)
                    )
                  }
                  sx={inputSx}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  label='Responsibilities (one per line)'
                  value={formData.responsibilities.join('\n')}
                  onChange={e =>
                    updateField(
                      'responsibilities',
                      e.target.value
                        .split('\n')
                        .map(line => line.trim())
                        .filter(Boolean)
                    )
                  }
                  sx={inputSx}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 2.5 }} />

          <Box component='div' sx={sectionSx}>
            <Typography
              variant='subtitle2'
              fontWeight={600}
              sx={{ mb: 1.5, pl: 1.5, borderLeft: 3, borderColor: 'primary.main' }}
              color='text.primary'
            >
              Contact Details
            </Typography>
            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Contact Name'
                  placeholder='Full name'
                  value={formData.contact.name}
                  onChange={e => updateContact('name', e.target.value)}
                  error={!!getError('contact.name')}
                  helperText={getError('contact.name')}
                  sx={inputSx}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='Mobile'
                  placeholder='9876543210'
                  value={formData.contact.mobileNumber}
                  onChange={e => updateContact('mobileNumber', e.target.value)}
                  error={!!getError('contact.mobileNumber')}
                  helperText={getError('contact.mobileNumber')}
                  sx={inputSx}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='WhatsApp'
                  placeholder='9876543210'
                  value={formData.contact.whatsappNumber}
                  onChange={e => updateContact('whatsappNumber', e.target.value)}
                  error={!!getError('contact.whatsappNumber')}
                  helperText={getError('contact.whatsappNumber')}
                  sx={inputSx}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type='email'
                  label='Email'
                  placeholder='email@example.com'
                  value={formData.contact.email}
                  onChange={e => updateContact('email', e.target.value)}
                  error={!!getError('contact.email')}
                  helperText={getError('contact.email')}
                  sx={inputSx}
                />
              </Grid>

              <Grid item xs={12} sx={{ display: 'flex', gap: 1.5, mt: 1 }}>
                <Button variant='contained' type='submit' disabled={isLoading} size='small'>
                  {isLoading ? <CircularProgress size={20} /> : isEdit ? 'Update' : 'Create'}
                </Button>
                <Button variant='outlined' onClick={() => router.push('/jobs')} size='small'>
                  Cancel
                </Button>
              </Grid>
            </Grid>
          </Box>
        </form>
      </CardContent>
    </Card>
  )
}

export default JobForm
