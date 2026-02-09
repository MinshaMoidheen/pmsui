'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import Link from 'next/link'

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
  useGetJobPostsQuery,
  useDeleteJobPostMutation,
  type GetJobsParams
} from '@/store/services/jobSlice'

// Type Imports
import type { IJobPost } from '@/types/job'
import { EMPLOYMENT_TYPE_OPTIONS } from '@/types/job'

const JobsList = () => {
  const [page, setPage] = useState(0)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState('')
  const [city, setCity] = useState<GetJobsParams['city']>(undefined)
  const [state, setState] = useState<GetJobsParams['state']>(undefined)
  const [employmentType, setEmploymentType] = useState<GetJobsParams['employmentType']>(undefined)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const params: GetJobsParams = {
    page: page + 1,
    limit,
    search: search || undefined,
    city: city || undefined,
    state: state || undefined,
    employmentType: employmentType || undefined
  }

  const { data, isLoading, isError, error } = useGetJobPostsQuery(params)
  const [deleteJobPost, { isLoading: isDeleting }] = useDeleteJobPostMutation()

  const jobs = data?.data?.jobs ?? []
  const pagination = data?.data?.pagination
  const total = pagination?.total ?? 0

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteJobPost(deleteId).unwrap()
      setDeleteId(null)
    } catch {
      // Error handled by mutation
    }
  }

  const getEmploymentLabel = (value: string) =>
    EMPLOYMENT_TYPE_OPTIONS.find(et => et.value === value)?.label ?? value

  return (
    <Card>
      <CardHeader
        title='Jobs'
        action={
          <Button variant='contained' component={Link} href='/jobs/create' startIcon={<i className='ri-add-line' />}>
            Add Job
          </Button>
        }
      />
      <CardContent>
        <div className='flex flex-wrap gap-4 mbe-4'>
          <TextField
            size='small'
            placeholder='Search...'
            value={search}
            onChange={e => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <i className='ri-search-line' />
                </InputAdornment>
              )
            }}
            sx={{ minWidth: 200 }}
          />
          <TextField
            size='small'
            label='City'
            value={city ?? ''}
            onChange={e => setCity((e.target.value || undefined) as GetJobsParams['city'])}
            sx={{ minWidth: 140 }}
          />
          <TextField
            size='small'
            label='State'
            value={state ?? ''}
            onChange={e => setState((e.target.value || undefined) as GetJobsParams['state'])}
            sx={{ minWidth: 140 }}
          />
          <TextField
            select
            size='small'
            label='Employment Type'
            value={employmentType ?? ''}
            onChange={e => setEmploymentType((e.target.value || undefined) as GetJobsParams['employmentType'])}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value=''>All</MenuItem>
            {EMPLOYMENT_TYPE_OPTIONS.map(et => (
              <MenuItem key={et.value} value={et.value}>
                {et.label}
              </MenuItem>
            ))}
          </TextField>
        </div>

        {isError && (
          <Alert severity='error' className='mbe-4'>
            {(error as { data?: { message?: string } })?.data?.message ?? 'Failed to load jobs'}
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
                    <TableCell>Title</TableCell>
                    <TableCell>Company</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell align='right'>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {jobs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align='center' className='py-8'>
                        No jobs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    jobs.map((job: IJobPost) => (
                      <TableRow key={job._id} hover>
                        <TableCell>{job.title}</TableCell>
                        <TableCell>{job.companyName}</TableCell>
                        <TableCell>
                          <Chip label={getEmploymentLabel(job.employmentType)} size='small' variant='outlined' />
                        </TableCell>
                        <TableCell>
                          {job.location?.city}, {job.location?.state}
                        </TableCell>
                        <TableCell align='right'>
                          <IconButton
                            size='small'
                            component={Link}
                            href={`/jobs/${job._id}/edit`}
                            aria-label='Edit'
                          >
                            <i className='ri-pencil-line' />
                          </IconButton>
                          <IconButton size='small' onClick={() => setDeleteId(job._id)} aria-label='Delete' color='error'>
                            <i className='ri-delete-bin-line' />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
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
        <DialogTitle>Delete Job</DialogTitle>
        <DialogContent>Are you sure you want to delete this job?</DialogContent>
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

export default JobsList

