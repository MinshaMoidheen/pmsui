'use client'

// React Imports
import { useState } from "react"

// Next Imports
import Link from "next/link"

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import IconButton from '@mui/material/IconButton'
import TablePagination from '@mui/material/TablePagination'
import Chip from '@mui/material/Chip'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

// Store Imports
import {
    useGetInterviewsQuery,
    useDeleteInterviewMutation,
    type GetInterViewParams,
    useGetJobPostsQuery,
} from "@/store/services/jobSlice"

// Type Imports
import type { IInterviewSchedule, InterviewStatus } from "@/types/interviewSchedule"
import { INTERVIEW_STATUS, INTERVIEW_TYPES } from "@/types/interviewSchedule"
import { IUser } from "@/types/users"
import { useGetUsersQuery } from "@/store/services/usersApiSlice"

const InterviewList = () => {
    const [page, setPage] = useState(0)
    const [limit, setLimit] = useState(10)
    const [status, setStatus] = useState<GetInterViewParams['status']>(undefined)
    const [jobId, setJobId] = useState<GetInterViewParams['jobId']>(undefined)
    const [applicantId, setApplicantId] = useState<GetInterViewParams['applicantId']>(undefined)
    const [deleteId, setDeleteId] = useState<string | null>(null)

    const params: GetInterViewParams = {
        page: page + 1,
        limit,
        ...(status && { status }),
        ...(jobId && { jobId }),
        ...(applicantId && { applicantId })

    }

    const { data, isLoading, isError, error } = useGetInterviewsQuery(params)
    const [deleteInterView, { isLoading: isDeleting }] = useDeleteInterviewMutation()

    const interviews = data?.data?.interviews ?? []
    const pagination = data?.data?.pagination
    const total = pagination?.total ?? 0

    const handleDelete = async () => {
        if (!deleteId) return
        try {
            await deleteInterView(deleteId).unwrap()
            setDeleteId(null)
        } catch {
            // Error handled by mutation
        }
    }

    const { data: jobData, } = useGetJobPostsQuery({
        page: 1,
        limit: 10,
    })

    const jobs = jobData?.data?.jobs ?? []

    const { data: usersData } = useGetUsersQuery({ page: 1, limit: 50 })
    const users: IUser[] = usersData?.data?.users ?? []

    const getStatusLabel = (st: InterviewStatus) => INTERVIEW_STATUS.find(s => s.value === st)?.label ?? st

    return (
        <Card>
            <CardHeader
                title='Interview Schedules'
                action={
                    <Button variant='contained' component={Link} href='/interviews/create' startIcon={<i className='ri-add-line' />}>
                        Add Interview
                    </Button>
                }
            />
            <CardContent>
                <div className="flex flex-wrap gap-4 mbe-4">
                    <TextField
                        select
                        size='small'
                        label='Status'
                        value={status ?? ''}
                        onChange={e => setStatus((e.target.value || undefined) as GetInterViewParams['status'])}
                        sx={{ minWidth: 120 }}
                    >
                        <MenuItem value=''>All</MenuItem>
                        {INTERVIEW_STATUS.map(st => (
                            <MenuItem key={st.value} value={st.value}>
                                {st.label}
                            </MenuItem>
                                    ))}
                    </TextField>
                    <TextField
                        select
                        size='small'
                        label='Job'
                        value={jobId ?? ''}
                        onChange={e => setJobId((e.target.value || undefined) as GetInterViewParams['jobId'])}
                        sx={{ minWidth: 180 }}
                    >
                        <MenuItem value=''>All</MenuItem>
                        {jobs.map(job => (
                            <MenuItem key={job._id} value={job._id}>
                                {job.title}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        select
                        size='small'
                        label='Applicant'
                        value={applicantId ?? ''}
                        onChange={e => setApplicantId((e.target.value || undefined) as GetInterViewParams['applicantId'])}
                        sx={{ minWidth: 180 }}
                       
                    >
                        <MenuItem value=''>All</MenuItem>
                        {users.map((u: IUser) => {
                            const applicant =
                                typeof u._id === 'string' ? undefined : u._id
                            const firstName = u.profile?.firstName ?? ''
                            const lastName = u.profile?.lastName ?? ''
                            const label =
                                (firstName || lastName)
                                    ? `${firstName} ${lastName}`.trim()
                                    : 'Unnamed Applicant'

                            return (
                                <MenuItem key={u._id} value={u._id}>
                                    {label}
                                </MenuItem>
                            )
                        })}
                    </TextField>
                </div>

                {isError && (
                    <Alert severity='error' className='mbe-4'>
                        {(error as { data?: { message?: string } })?.data?.message ?? 'Failed to load Interview Schedules'}
                    </Alert>
                )}

                {isLoading ? (
                    <div className='flex justify-center p-8'>
                        <CircularProgress />
                    </div>
                ) : (
                    <> <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Job</TableCell>
                                    <TableCell>Applicant</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Interview Type</TableCell>
                                    <TableCell>Schedule Date</TableCell>
                                    <TableCell>Location</TableCell>
                                    <TableCell align='right'>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {interviews.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align='center' className='py-8'>
                                            No Interviews found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    interviews.map((interview: IInterviewSchedule) => {
                                        const jobPost =
                                            typeof interview.jobPost === 'string'
                                                ? undefined
                                                : interview.jobPost
                                        const jobTitle = jobPost?.title ?? 'N/A'

                                        const applicant =
                                            typeof interview.applicant === 'string'
                                                ? undefined
                                                : interview.applicant as IUser
                                        const applicantName =
                                            (applicant?.profile?.firstName || applicant?.profile?.lastName)
                                                ? `${applicant?.profile?.firstName} ${applicant?.profile?.lastName}`.trim()
                                                : 'Unnamed Applicant'
                                                
                                        return (
                                            <TableRow key={interview._id} hover>
                                                <TableCell>{jobTitle}</TableCell>
                                                <TableCell>
                                                    <Chip label={applicantName} size='small' variant='outlined' />
                                                </TableCell>
                                                <TableCell>{getStatusLabel(interview.status)}</TableCell>
                                                <TableCell>{interview.interviewType}</TableCell>
                                                <TableCell>{new Date(interview.scheduledAt).toLocaleString()}</TableCell>
                                                <TableCell>{interview.location}</TableCell>
                                                <TableCell align='right'>
                                                    <IconButton
                                                        size='small'
                                                        component={Link}
                                                        href={`/interviews/${interview._id}/edit`}
                                                        aria-label='Edit'
                                                    >
                                                        <i className='ri-pencil-line' />
                                                    </IconButton>
                                                    <IconButton size='small' onClick={() => setDeleteId(interview._id)} aria-label='Delete' color='error'>
                                                        <i className='ri-delete-bin-line' />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                        <TablePagination
                            component='div'
                            count={total}
                            page={page}
                            onPageChange={(_, newPage) => setPage(newPage)}
                            rowsPerPage={limit}
                            onRowsPerPageChange={e => {
                                setLimit(parseInt(e.target.value, 10))
                                setPage(0)
                            }}
                            rowsPerPageOptions={[5, 10, 25, 50]}
                        />
                    </>
                )}
            </CardContent>

            <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
                <DialogTitle>Delete Interview Schedule</DialogTitle>
                <DialogContent>Are you sure you want to delete this Interview Schedule?</DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteId(null)}>Cancel</Button>
                    <Button variant='contained' color='error' onClick={handleDelete} disabled={isDeleting}>
                        {isDeleting ? <CircularProgress size={24} /> : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    )
}

export default InterviewList