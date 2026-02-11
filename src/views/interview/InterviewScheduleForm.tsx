'use client'

// React Imports
import { useState, useEffect } from 'react'
import type { FormEvent, ChangeEvent } from 'react'

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
import {
    useCreateInterviewScheduleMutation,
    useUpdateInterviewMutation,
    useGetInterviewByIdQuery,
    useGetJobPostsQuery,
} from '@/store/services/jobSlice'
import { useGetUsersQuery } from '@/store/services/usersApiSlice'

import type { IJobPost, IJobApplication } from '@/types/job'
import type { createInterviewScheduleRequest, InterviewStatus, InterviewType } from '@/types/interviewSchedule'
import { INTERVIEW_STATUS, INTERVIEW_TYPES } from '@/types/interviewSchedule'

// Schema Imports
import { interviewScheduleFormSchema } from '@/schemas/interviewSchema'
import { Checkbox, FormControlLabel } from '@mui/material'
import { IUser } from '@/types/users'

const defaultFormValues: createInterviewScheduleRequest = {
    jobPostId: '',
    applicantId: '',
    interviewType: 'IN_PERSON',
    scheduledAt: new Date(),
    duration: 0,
    location: '',
    meetingLink: '',
    contactNumber: '',
    instructions: '',
    status: 'SCHEDULED',
    notes: '',
    paymentRequired: false,
    paymentAmount: 0,
    paymentStatus: 'PENDING',
    paymentId: '',
}

const inputSx = {
    '& .MuiInputBase-input': { py: 0.875, px: 1.25, fontSize: '0.9375rem', minHeight: 38 },
    '& .MuiInputLabel-root': { fontSize: '0.875rem', fontWeight: 500 },
    '& .MuiFormHelperText-root': { fontSize: '0.75rem', mt: 0.5 },
    '& .MuiOutlinedInput-root': { borderRadius: 1.25 }
}

const sectionSx = { mb: 3 }

interface InterviewScheduleFormProps {
    id?: string
}

const InterviewScheduleForm = ({ id }: InterviewScheduleFormProps) => {
    const router = useRouter()
    const isEdit = !!id

    const [formData, setFormData] = useState<createInterviewScheduleRequest>(defaultFormValues);
    const [error, setError] = useState('')
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const { data: interviewScheduleData, isLoading: isLoadingInterviewSchedule } = useGetInterviewByIdQuery(id!, { skip: !id });
    const [createInterviewSchedule, { isLoading: isCreating }] = useCreateInterviewScheduleMutation();
    const [updateInterviewSchedule, { isLoading: isUpdating }] = useUpdateInterviewMutation();

    // Jobs for dropdown
    const { data: jobData } = useGetJobPostsQuery({
        page: 1,
        limit: 100,
    })
    const jobs: IJobPost[] = jobData?.data?.jobs ?? []

    const { data: usersData } = useGetUsersQuery({ page: 1, limit: 50 })
    const users: IUser[] = usersData?.data?.users ?? []

    const isLoading = isCreating || isUpdating

    useEffect(() => {
        const p = interviewScheduleData?.data?.interview
        if (p) {
            const jobPostId =
                typeof p.jobPost === 'string'
                    ? p.jobPost
                    : (p.jobPost as IJobPost | undefined)?._id || ''

            const applicantId =
                typeof p.applicant === 'string'
                    ? p.applicant
                    : (p.applicant as IUser | undefined)?._id || ''

            setFormData({
                jobPostId,
                applicantId,
                interviewType: p.interviewType,
                scheduledAt: p.scheduledAt,
                duration: p.duration,
                location: p.location,
                meetingLink: p.meetingLink,
                contactNumber: p.contactNumber,
                instructions: p.instructions,
                status: p.status,
                notes: p.notes,
                paymentRequired: p.paymentRequired,
                paymentAmount: p.paymentAmount,
                paymentStatus: p.paymentStatus,
                paymentId: p.paymentId,
            })
        }
    }, [interviewScheduleData])


    const updateField = (field: keyof createInterviewScheduleRequest, value: unknown) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (fieldErrors[field]) setFieldErrors(prev => ({ ...prev, [field]: '' }))
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError('')
        setFieldErrors({})

        const result = interviewScheduleFormSchema.safeParse({
            ...formData,
            scheduledAt: new Date(formData.scheduledAt)
        })

        if (!result.success) {
            const errors: Record<string, string> = {}
            result.error.issues.forEach(issue => {
                const path = issue.path.join('.')
                const key = path.startsWith('scheduledAt') ? 'scheduledAt' : path
                if (!errors[key]) errors[key] = issue.message
            })
            setFieldErrors(errors)
            setError(result.error.issues[0]?.message ?? 'Please fix the errors below')
            return
        }

        const payload: createInterviewScheduleRequest = {
            jobPostId: result.data.jobPostId,
            applicantId: result.data.applicantId,
            interviewType: result.data.interviewType as InterviewType,
            scheduledAt: result.data.scheduledAt,
            duration: result.data.duration,
            location: result.data.location,
            meetingLink: result.data.meetingLink,
            contactNumber: result.data.contactNumber,
            instructions: result.data.instructions,
            status: result.data.status as InterviewStatus,
            notes: result.data.notes,
            paymentRequired: result.data.paymentRequired,
            paymentAmount: result.data.paymentAmount,
            paymentStatus: result.data.paymentStatus,
            paymentId: result.data.paymentId,
        }

        try {
            if (isEdit && id) {
                await updateInterviewSchedule({ id, data: payload }).unwrap()
            } else {
                await createInterviewSchedule(payload).unwrap()
            }
            router.push('/interviews')
        } catch (err: any) {
            setError(err?.data?.message || 'Failed to save interview schedule')
        }
    }

    const formatDateTimeLocal = (date: Date | string) => {
        const d = new Date(date)
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        const hours = String(d.getHours()).padStart(2, '0')
        const minutes = String(d.getMinutes()).padStart(2, '0')
        return `${year}-${month}-${day}T${hours}:${minutes}`
    }

    if (isLoadingInterviewSchedule) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
                <CircularProgress />
            </Box>
        )
    }

    return (
        <Card>
            <CardHeader title={isEdit ? 'Edit Interview Schedule' : 'Create Interview Schedule'} />
            <CardContent>
                <form onSubmit={handleSubmit}>
                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    {/* Basic Information Section */}
                    <Box sx={sectionSx}>
                        <Typography variant="h6" sx={{ mb: 2, fontSize: '1rem', fontWeight: 600 }}>
                            Basic Information
                        </Typography>
                        <Grid container spacing={2.5}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Job"
                                    value={formData.jobPostId}
                                    onChange={e => {
                                        const newJobId = e.target.value
                                        updateField('jobPostId', newJobId)
                                        // Reset applicant when job changes
                                        updateField('applicantId', '')
                                    }}
                                    error={!!fieldErrors.jobPostId}
                                    helperText={fieldErrors.jobPostId}
                                    required
                                    sx={inputSx}
                                >
                                    <MenuItem value="">Select Job</MenuItem>
                                    {jobs.map(job => (
                                        <MenuItem key={job._id} value={job._id}>
                                            {job.title}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    select={!!users.length}
                                    label="Applicant"
                                    value={formData.applicantId}
                                    onChange={e => updateField('applicantId', e.target.value)}
                                    error={!!fieldErrors.applicantId}
                                    helperText={fieldErrors.applicantId}
                                    required
                                    sx={inputSx}

                                >
                                    <MenuItem value="">Select Applicant</MenuItem>
                                    {users.map((u: IUser) => (
                                        <MenuItem key={u._id} value={u._id}>
                                            {[u.profile?.firstName, u.profile?.lastName].filter(Boolean).join(' ') || u.mobileNumber || u._id}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Interview Type"
                                    value={formData.interviewType}
                                    onChange={e => updateField('interviewType', e.target.value)}
                                    error={!!fieldErrors.interviewType}
                                    helperText={fieldErrors.interviewType}
                                    required
                                    sx={inputSx}
                                >
                                    {INTERVIEW_TYPES.map(type => (
                                        <MenuItem key={type.value} value={type.value}>
                                            {type.label}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Status"
                                    value={formData.status}
                                    onChange={e => updateField('status', e.target.value)}
                                    error={!!fieldErrors.status}
                                    helperText={fieldErrors.status}
                                    required
                                    sx={inputSx}
                                >
                                    {INTERVIEW_STATUS.map(status => (
                                        <MenuItem key={status.value} value={status.value}>
                                            {status.label}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                        </Grid>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    {/* Schedule Details Section */}
                    <Box sx={sectionSx}>
                        <Typography variant="h6" sx={{ mb: 2, fontSize: '1rem', fontWeight: 600 }}>
                            Schedule Details
                        </Typography>
                        <Grid container spacing={2.5}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Scheduled At"
                                    type="datetime-local"
                                    value={formatDateTimeLocal(formData.scheduledAt)}
                                    onChange={e => updateField('scheduledAt', new Date(e.target.value))}
                                    error={!!fieldErrors.scheduledAt}
                                    helperText={fieldErrors.scheduledAt}
                                    required
                                    InputLabelProps={{ shrink: true }}
                                    sx={inputSx}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Duration (minutes)"
                                    type="number"
                                    value={formData.duration}
                                    onChange={e => updateField('duration', Number(e.target.value))}
                                    error={!!fieldErrors.duration}
                                    helperText={fieldErrors.duration}
                                    required
                                    inputProps={{ min: 0 }}
                                    sx={inputSx}
                                />
                            </Grid>
                        </Grid>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    {/* Contact Information Section */}
                    <Box sx={sectionSx}>
                        <Typography variant="h6" sx={{ mb: 2, fontSize: '1rem', fontWeight: 600 }}>
                            Contact Information
                        </Typography>
                        <Grid container spacing={2.5}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Location"
                                    value={formData.location}
                                    onChange={e => updateField('location', e.target.value)}
                                    error={!!fieldErrors.location}
                                    helperText={fieldErrors.location}
                                    sx={inputSx}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Contact Number"
                                    value={formData.contactNumber}
                                    onChange={e => updateField('contactNumber', e.target.value)}
                                    error={!!fieldErrors.contactNumber}
                                    helperText={fieldErrors.contactNumber}
                                    sx={inputSx}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Meeting Link"
                                    value={formData.meetingLink}
                                    onChange={e => updateField('meetingLink', e.target.value)}
                                    error={!!fieldErrors.meetingLink}
                                    helperText={fieldErrors.meetingLink}
                                    sx={inputSx}
                                />
                            </Grid>
                        </Grid>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    {/* Additional Information Section */}
                    <Box sx={sectionSx}>
                        <Typography variant="h6" sx={{ mb: 2, fontSize: '1rem', fontWeight: 600 }}>
                            Additional Information
                        </Typography>
                        <Grid container spacing={2.5}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Instructions"
                                    multiline
                                    rows={3}
                                    value={formData.instructions}
                                    onChange={e => updateField('instructions', e.target.value)}
                                    error={!!fieldErrors.instructions}
                                    helperText={fieldErrors.instructions}
                                    sx={inputSx}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Notes"
                                    multiline
                                    rows={3}
                                    value={formData.notes}
                                    onChange={e => updateField('notes', e.target.value)}
                                    error={!!fieldErrors.notes}
                                    helperText={fieldErrors.notes}
                                    sx={inputSx}
                                />
                            </Grid>
                        </Grid>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    {/* Payment Information Section */}
                    <Box sx={sectionSx}>
                        <Typography variant="h6" sx={{ mb: 2, fontSize: '1rem', fontWeight: 600 }}>
                            Payment Information
                        </Typography>
                        <Grid container spacing={2.5}>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={formData.paymentRequired}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => updateField('paymentRequired', e.target.checked)}
                                        />
                                    }
                                    label="Payment Required"
                                />
                            </Grid>
                            {formData.paymentRequired && (
                                <>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Payment Amount"
                                            type="number"
                                            value={formData.paymentAmount}
                                            onChange={e => updateField('paymentAmount', Number(e.target.value))}
                                            error={!!fieldErrors.paymentAmount}
                                            helperText={fieldErrors.paymentAmount}
                                            inputProps={{ min: 0, step: 0.01 }}
                                            sx={inputSx}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Payment Status"
                                            value={formData.paymentStatus}
                                            onChange={e => updateField('paymentStatus', e.target.value)}
                                            error={!!fieldErrors.paymentStatus}
                                            helperText={fieldErrors.paymentStatus}
                                            sx={inputSx}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Payment ID"
                                            value={formData.paymentId}
                                            onChange={e => updateField('paymentId', e.target.value)}
                                            error={!!fieldErrors.paymentId}
                                            helperText={fieldErrors.paymentId}
                                            sx={inputSx}
                                        />
                                    </Grid>
                                </>
                            )}
                        </Grid>
                    </Box>

                    {/* Form Actions */}
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
                        <Button
                            variant="outlined"
                            onClick={() => router.push('/interviews')}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isLoading}
                            startIcon={isLoading && <CircularProgress size={20} />}
                        >
                            {isLoading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
                        </Button>
                    </Box>
                </form>
            </CardContent>
        </Card>
    )
}

export default InterviewScheduleForm