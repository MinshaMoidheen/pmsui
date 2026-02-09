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
import TablePagination from '@mui/material/TablePagination'
import Chip from '@mui/material/Chip'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import IconButton from '@mui/material/IconButton'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

// Store Imports
import { useGetMyJobApplicationsQuery, useUpdateApplicationStatusMutation } from '@/store/services/jobSlice'

// Types
import type { IJobApplication, ApplicationStatus } from '@/types/job'

const APPLICATION_STATUS_OPTIONS: { value: ApplicationStatus | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'SHORTLISTED', label: 'Shortlisted' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'ACCEPTED', label: 'Accepted' }
]

const MyApplicationsList = () => {
  const [page, setPage] = useState(0)
  const [limit, setLimit] = useState(10)
  const [status, setStatus] = useState<ApplicationStatus | ''>('')
  const [editApp, setEditApp] = useState<IJobApplication | null>(null)
  const [editStatus, setEditStatus] = useState<ApplicationStatus>('PENDING')
  const [editNotes, setEditNotes] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading, isError, error } = useGetMyJobApplicationsQuery({
    status: status || undefined,
    page: page + 1,
    limit
  })

  const applications = data?.data?.applications ?? []
  const pagination = data?.data?.pagination
  const total = pagination?.total ?? applications.length

  const [updateStatus, { isLoading: isUpdating }] = useUpdateApplicationStatusMutation()

  const handleOpenEdit = (app: IJobApplication) => {
    setEditApp(app)
    setEditStatus(app.status)
    setEditNotes(app.notes || '')
  }

  const handleSaveEdit = async () => {
    if (!editApp) return

    try {
      await updateStatus({
        id: editApp._id,
        data: { status: editStatus, notes: editNotes || undefined }
      }).unwrap()
      setEditApp(null)
    } catch {
      // errors handled via RTK Query
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      await updateStatus({
        id: deleteId,
        data: { status: 'REJECTED', notes: 'Deleted by user' }
      }).unwrap()
      setDeleteId(null)
    } catch {
      // errors handled via RTK Query
    }
  }

  return (
    <Card>
      <CardHeader
        title='My Job Applications'
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
                    <TableCell>Job</TableCell>
                    <TableCell>Company</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Applied At</TableCell>
                    <TableCell>Notes</TableCell>
                    <TableCell align='right'>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {applications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align='center' className='py-8'>
                        No applications found
                      </TableCell>
                    </TableRow>
                  ) : (
                    applications.map((app: IJobApplication) => {
                      const job =
                        typeof app.jobPost === 'string'
                          ? undefined
                          : app.jobPost

                      return (
                        <TableRow key={app._id} hover>
                          <TableCell>{job?.title ?? '—'}</TableCell>
                          <TableCell>{job?.companyName ?? '—'}</TableCell>
                          <TableCell>
                            <Chip label={app.status} size='small' />
                          </TableCell>
                          <TableCell>{new Date(app.appliedAt).toLocaleString()}</TableCell>
                          <TableCell>{app.notes ?? '—'}</TableCell>
                          <TableCell align='right'>
                            <IconButton size='small' aria-label='Edit' onClick={() => handleOpenEdit(app)}>
                              <i className='ri-pencil-line' />
                            </IconButton>
                            <IconButton
                              size='small'
                              aria-label='Delete'
                              color='error'
                              onClick={() => setDeleteId(app._id)}
                            >
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
      {/* Edit dialog */}
      <Dialog open={!!editApp} onClose={() => setEditApp(null)} fullWidth maxWidth='sm'>
        <DialogTitle>Edit Application</DialogTitle>
        <DialogContent>
          <div className='flex flex-col gap-4 mt-2'>
            <TextField
              select
              fullWidth
              label='Status'
              value={editStatus}
              onChange={e => setEditStatus(e.target.value as ApplicationStatus)}
            >
              {APPLICATION_STATUS_OPTIONS.filter(opt => opt.value).map(opt => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              multiline
              minRows={3}
              label='Notes'
              value={editNotes}
              onChange={e => setEditNotes(e.target.value)}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditApp(null)}>Cancel</Button>
          <Button onClick={handleSaveEdit} disabled={isUpdating} variant='contained'>
            {isUpdating ? <CircularProgress size={20} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete Application</DialogTitle>
        <DialogContent>Are you sure you want to delete this application?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button onClick={handleDelete} color='error' variant='contained' disabled={isUpdating}>
            {isUpdating ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default MyApplicationsList

