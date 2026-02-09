'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

// RTK Query
import { skipToken } from '@reduxjs/toolkit/query'

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
import TablePagination from '@mui/material/TablePagination'
import Chip from '@mui/material/Chip'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

// Store Imports
import { useGetJobApplicationsQuery } from '@/store/services/jobSlice'

// Types
import type { IJobApplication, ApplicationStatus } from '@/types/job'

const APPLICATION_STATUS_OPTIONS: { value: ApplicationStatus | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'SHORTLISTED', label: 'Shortlisted' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'ACCEPTED', label: 'Accepted' }
]

const JobApplicationsList = () => {
  const searchParams = useSearchParams()
  const jobId = searchParams.get('jobId') || ''

  const [page, setPage] = useState(0)
  const [limit, setLimit] = useState(10)
  const [status, setStatus] = useState<ApplicationStatus | ''>('')

  const queryArg = jobId
    ? {
        jobId,
        status: status || undefined,
        page: page + 1,
        limit
      }
    : skipToken

  const { data, isLoading, isError, error } = useGetJobApplicationsQuery(queryArg as any)

  const applications = data?.data?.applications ?? []
  const pagination = data?.data?.pagination
  const total = pagination?.total ?? applications.length

  return (
    <Card>
      <CardHeader
        title='Job Applications'
        subheader={jobId ? `Job ID: ${jobId}` : 'Select a job to view applications'}
        action={
          <Button
            variant='contained'
            size='small'
            component={Link}
            href='/jobs/applications/create'
            startIcon={<i className='ri-add-line' />}
          >
            Create
          </Button>
        }
      />
      <CardContent>
        <div className='flex flex-wrap gap-4 mbe-4'>
          <TextField
            select
            size='small'
            label='Status'
            value={status}
            onChange={e => {
              setPage(0)
              setStatus(e.target.value as ApplicationStatus | '')
            }}
            sx={{ minWidth: 160 }}
          >
            {APPLICATION_STATUS_OPTIONS.map(opt => (
              <MenuItem key={opt.value || 'all'} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
        </div>

        {isError && (
          <Alert severity='error' className='mbe-4'>
            {(error as { data?: { message?: string } })?.data?.message ?? 'Failed to load applications'}
          </Alert>
        )}

        {isLoading ? (
          <div className='flex justify-center p-8'>
            <CircularProgress />
          </div>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Applicant</TableCell>
                    <TableCell>Mobile</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Applied At</TableCell>
                    <TableCell>Notes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {applications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align='center' className='py-8'>
                        No applications found
                      </TableCell>
                    </TableRow>
                  ) : (
                    applications.map((app: IJobApplication) => {
                      const applicant =
                        typeof app.applicant === 'string'
                          ? undefined
                          : app.applicant
                      const fullName =
                        applicant?.profile?.firstName || applicant?.profile?.lastName
                          ? [applicant?.profile?.firstName, applicant?.profile?.lastName].filter(Boolean).join(' ')
                          : '—'

                      return (
                        <TableRow key={app._id} hover>
                          <TableCell>{fullName}</TableCell>
                          <TableCell>{applicant?.mobileNumber ?? '—'}</TableCell>
                          <TableCell>
                            <Chip label={app.status} size='small' />
                          </TableCell>
                          <TableCell>{new Date(app.appliedAt).toLocaleString()}</TableCell>
                          <TableCell>{app.notes ?? '—'}</TableCell>
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
    </Card>
  )
}

export default JobApplicationsList

