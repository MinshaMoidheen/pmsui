'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import Link from 'next/link'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
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
import Button from '@mui/material/Button'

// Store Imports
import { useGetUsersQuery, useDeleteUserMutation } from '@/store/services/usersApiSlice'

// Type Imports
import type { GetUsersParams, IUser } from '@/types/users'
import { USER_ROLE_OPTIONS } from '@/types/users'

const UsersList = () => {
  const [page, setPage] = useState(0)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState<GetUsersParams['role']>(undefined)
  const [isActive, setIsActive] = useState<GetUsersParams['isActive']>(undefined)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const params: GetUsersParams = {
    page: page + 1,
    limit,
    search: search || undefined,
    role: role || undefined,
    isActive: isActive || undefined
  }

  const { data, isLoading, isError, error } = useGetUsersQuery(params)
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation()

  const users = (data?.data?.users ?? []).filter(user => user.role !== 'SUPER_ADMIN')
  const pagination = data?.data?.pagination
  const total = pagination?.total ?? users.length

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteUser(deleteId).unwrap()
      setDeleteId(null)
    } catch {
      // Error handled by mutation
    }
  }

  const getRoleLabel = (value: string) =>
    USER_ROLE_OPTIONS.find(r => r.value === value)?.label ?? value

  return (
    <Card>
      <CardHeader
        title='Users'
        action={
          <Button
            variant='contained'
            size='small'
            href='/users/create'
            startIcon={<i className='ri-user-add-line' />}
          >
            Add User
          </Button>
        }
      />
      <CardContent>
        <div className='flex flex-wrap gap-4 mbe-4'>
          <TextField
            size='small'
            placeholder='Search by name or mobile...'
            value={search}
            onChange={e => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <i className='ri-search-line' />
                </InputAdornment>
              )
            }}
            sx={{ minWidth: 220 }}
          />
          <TextField
            select
            size='small'
            label='Role'
            value={role ?? ''}
            onChange={e => setRole((e.target.value || undefined) as GetUsersParams['role'])}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value=''>All</MenuItem>
            {USER_ROLE_OPTIONS.filter(r => r.value !== 'SUPER_ADMIN').map(r => (
              <MenuItem key={r.value} value={r.value}>
                {r.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size='small'
            label='Status'
            value={isActive ?? ''}
            onChange={e => setIsActive((e.target.value || undefined) as GetUsersParams['isActive'])}
            sx={{ minWidth: 140 }}
          >
            <MenuItem value=''>All</MenuItem>
            <MenuItem value='true'>Active</MenuItem>
            <MenuItem value='false'>Inactive</MenuItem>
          </TextField>
        </div>

        {isError && (
          <Alert severity='error' className='mbe-4'>
            {(error as { data?: { message?: string } })?.data?.message ?? 'Failed to load users'}
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
                    <TableCell>Name</TableCell>
                    <TableCell>Mobile</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Verified</TableCell>
                    <TableCell align='right'>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align='center' className='py-8'>
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user: IUser) => {
                      const fullName =
                        user.profile?.firstName || user.profile?.lastName
                          ? [user.profile?.firstName, user.profile?.lastName].filter(Boolean).join(' ')
                          : '—'

                      return (
                        <TableRow key={user._id} hover>
                          <TableCell>{fullName}</TableCell>
                          <TableCell>{user.mobileNumber ?? '—'}</TableCell>
                          <TableCell>
                            <Chip label={getRoleLabel(user.role)} size='small' variant='outlined' />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={user.isActive ? 'Active' : 'Inactive'}
                              color={user.isActive ? 'success' : 'default'}
                              size='small'
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={user.isMobileVerified ? 'Verified' : 'Unverified'}
                              color={user.isMobileVerified ? 'primary' : 'default'}
                              size='small'
                            />
                          </TableCell>
                          <TableCell align='right'>
                            <IconButton
                              size='small'
                              component={Link}
                              href={`/users/${user._id}/edit`}
                              aria-label='Edit'
                            >
                              <i className='ri-pencil-line' />
                            </IconButton>
                            <IconButton
                              size='small'
                              onClick={() => setDeleteId(user._id)}
                              aria-label='Delete'
                              color='error'
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

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>Are you sure you want to delete this user?</DialogContent>
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

export default UsersList

