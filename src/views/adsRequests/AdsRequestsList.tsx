'use client'

// React Imports
import { useState } from 'react'

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
import TablePagination from '@mui/material/TablePagination'
import Chip from '@mui/material/Chip'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Select from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'

// Store Imports
import { useGetAdRequestsQuery, useUpdateAdRequestStatusMutation } from '@/store/services/adsApiSlice'

// Type Imports
import { AdRequestStatus, AdType, IAdRequest } from '@/types/ads'

const AdsRequestsList = () => {
  // States
  const [page, setPage] = useState(0)
  const [limit, setLimit] = useState(10)
  const [adType, setAdType] = useState<AdType | ''>('')
  const [status, setStatus] = useState<AdRequestStatus | ''>('')

  // Hooks
  const { data, isLoading, isError, error } = useGetAdRequestsQuery({
    adType: adType || undefined,
    status: status || undefined,
    page: page + 1,
    limit
  })

  const [updateStatus, { isLoading: isUpdating }] = useUpdateAdRequestStatusMutation()

  const requests = data?.data?.requests ?? []
  const pagination = data?.data?.pagination
  const total = pagination?.total ?? 0

  const handleStatusUpdate = async (id: string, newStatus: AdRequestStatus) => {
    try {
      await updateStatus({ id, status: newStatus }).unwrap()
    } catch (err) {
      console.error('Failed to update status:', err)
    }
  }

  const getStatusColor = (status: AdRequestStatus) => {
    switch (status) {
      case 'PENDING':
        return 'warning'
      case 'CONTACTED':
        return 'info'
      case 'RESOLVED':
        return 'success'
      case 'CANCELLED':
        return 'error'
      default:
        return 'default'
    }
  }

  return (
    <Card>
      <CardHeader title='Ads Requests' />
      <CardContent>
        <div className='flex flex-wrap gap-4 mbe-4'>
          <TextField
            select
            size='small'
            label='Ad Type'
            value={adType}
            onChange={e => setAdType(e.target.value as AdType | '')}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value=''>All Types</MenuItem>
            <MenuItem value='PROPERTY_SALE'>Property Sale</MenuItem>
            <MenuItem value='PROPERTY_RENT'>Property Rent</MenuItem>
            <MenuItem value='JOB'>Job</MenuItem>
          </TextField>

          <TextField
            select
            size='small'
            label='Status'
            value={status}
            onChange={e => setStatus(e.target.value as AdRequestStatus | '')}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value=''>All Status</MenuItem>
            <MenuItem value='PENDING'>Pending</MenuItem>
            <MenuItem value='CONTACTED'>Contacted</MenuItem>
            <MenuItem value='RESOLVED'>Resolved</MenuItem>
            <MenuItem value='CANCELLED'>Cancelled</MenuItem>
          </TextField>
        </div>

        {isError && (
          <Alert severity='error' className='mbe-4'>
            {(error as { data?: { message?: string } })?.data?.message ?? 'Failed to load ad requests'}
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
                    <TableCell>Ad Type</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Contact Name</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created At</TableCell>
                    <TableCell align='right'>Update Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align='center' className='py-8'>
                        No ad requests found
                      </TableCell>
                    </TableRow>
                  ) : (
                    requests.map((request: IAdRequest) => (
                      <TableRow key={request._id} hover>
                        <TableCell>
                          <Chip label={request.adType.replace('_', ' ')} size='small' variant='outlined' />
                        </TableCell>
                        <TableCell>{request.title}</TableCell>
                        <TableCell>{request.contact.name}</TableCell>
                        <TableCell>{request.contact.phone}</TableCell>
                        <TableCell>
                          <Chip label={request.status} color={getStatusColor(request.status)} size='small' />
                        </TableCell>
                        <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell align='right'>
                          <FormControl size='small' sx={{ minWidth: 120 }}>
                            <Select
                              value={request.status}
                              onChange={e => handleStatusUpdate(request._id, e.target.value as AdRequestStatus)}
                              displayEmpty
                              disabled={isUpdating}
                            >
                              <MenuItem value='PENDING'>Pending</MenuItem>
                              <MenuItem value='CONTACTED'>Contacted</MenuItem>
                              <MenuItem value='RESOLVED'>Resolved</MenuItem>
                              <MenuItem value='CANCELLED'>Cancelled</MenuItem>
                            </Select>
                          </FormControl>
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
    </Card>
  )
}

export default AdsRequestsList
