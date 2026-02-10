'use client'

import { useState } from 'react'
import Link from 'next/link'
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
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

import { useAuth } from '@/contexts/AuthContext'
import {
  useGetUserSubscriptionsQuery,
  useGetAllSubscriptionsQuery,
  useCancelSubscriptionMutation
} from '@/store/services/subscriptionsApiSlice'
import type { IUserSubscription, UserSubscriptionStatus, SubscriptionType } from '@/types/subscription'
import { SUBSCRIPTION_STATUS_OPTIONS, SUBSCRIPTION_TYPE_OPTIONS } from '@/types/subscription'
import type { GetAllSubscriptionsParams, GetUserSubscriptionsParams } from '@/types/subscription'

const SubscriptionList = () => {
  const { user } = useAuth()
  const isSuperAdmin = user?.role === 'SUPER_ADMIN'

  const [page, setPage] = useState(0)
  const [limit, setLimit] = useState(10)
  const [status, setStatus] = useState<GetUserSubscriptionsParams['status']>(undefined)
  const [subscriptionType, setSubscriptionType] = useState<GetAllSubscriptionsParams['subscriptionType']>(undefined)
  const [cancelId, setCancelId] = useState<string | null>(null)
  const [cancelReason, setCancelReason] = useState('')

  const myParams: GetUserSubscriptionsParams = {
    page: page + 1,
    limit,
    ...(status && { status })
  }
  const allParams: GetAllSubscriptionsParams = {
    page: page + 1,
    limit,
    ...(status && { status }),
    ...(subscriptionType && { subscriptionType })
  }

  const { data: myData, isLoading: myLoading, isError: myError, error: myErr } = useGetUserSubscriptionsQuery(myParams, { skip: isSuperAdmin })
  const { data: allData, isLoading: allLoading, isError: allError, error: allErr } = useGetAllSubscriptionsQuery(allParams, { skip: !isSuperAdmin })

  const [cancelSubscription, { isLoading: isCancelling }] = useCancelSubscriptionMutation()

  const data = isSuperAdmin ? allData : myData
  const isLoading = isSuperAdmin ? allLoading : myLoading
  const isError = isSuperAdmin ? allError : myError
  const error = isSuperAdmin ? allErr : myErr

  const subscriptions: IUserSubscription[] = data?.data?.subscriptions ?? []
  const pagination = data?.data?.pagination
  const total = pagination?.total ?? 0

  const handleCancel = async () => {
    if (!cancelId) return
    try {
      await cancelSubscription({ subscriptionId: cancelId, reason: cancelReason || undefined }).unwrap()
      setCancelId(null)
      setCancelReason('')
    } catch {
      // Error handled by mutation
    }
  }

  const formatDate = (d: string) => (d ? new Date(d).toLocaleDateString() : '-')
  const formatPrice = (amount: number, currency: string) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: currency || 'INR', maximumFractionDigits: 0 }).format(amount)

  const getStatusLabel = (s: UserSubscriptionStatus) => SUBSCRIPTION_STATUS_OPTIONS.find(o => o.value === s)?.label ?? s
  const getTypeLabel = (t: SubscriptionType) => SUBSCRIPTION_TYPE_OPTIONS.find(o => o.value === t)?.label ?? t

  return (
    <Card>
  <CardHeader
    title={isSuperAdmin ? 'All Subscriptions' : 'My Subscriptions'}
    action={
      <Button variant='contained' component={Link} href='/subscriptions/create' startIcon={<i className='ri-add-line' />}>
        Add Subscription
      </Button>
    }
  />

  <CardContent>
    <div className='flex flex-wrap gap-4 mbe-4'>
      <TextField
        select
        size='small'
        label='Status'
        value={status ?? ''}
        onChange={e => setStatus((e.target.value || undefined) as GetUserSubscriptionsParams['status'])}
        sx={{ minWidth: 160 }}
      >
        <MenuItem value=''>All</MenuItem>
        {SUBSCRIPTION_STATUS_OPTIONS.filter(o => o.value !== 'PENDING').map(opt => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </TextField>
      {isSuperAdmin && (
        <TextField
          select
          size='small'
          label='Type'
          value={subscriptionType ?? ''}
          onChange={e => setSubscriptionType((e.target.value || undefined) as SubscriptionType)}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value=''>All</MenuItem>
          {SUBSCRIPTION_TYPE_OPTIONS.map(opt => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>
      )}
    </div>

    {isError && (
      <Alert severity='error' className='mbe-4'>
        {(error as { data?: { message?: string } })?.data?.message ?? 'Failed to load subscriptions'}
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
                {isSuperAdmin && <TableCell>User</TableCell>}
                <TableCell>Plan / Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Start</TableCell>
                <TableCell>End</TableCell>
                <TableCell>Amount</TableCell>
                {isSuperAdmin && <TableCell>Usage</TableCell>}
                {!isSuperAdmin && <TableCell align='right'>Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {subscriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isSuperAdmin ? 8 : 7} align='center' className='py-8'>
                    No subscriptions found
                  </TableCell>
                </TableRow>
              ) : (
                subscriptions.map((sub: IUserSubscription) => {
                  const plan = typeof sub.subscriptionPlan === 'object' ? sub.subscriptionPlan : null
                  return (
                    <TableRow key={sub._id} hover>
                      {isSuperAdmin && (
                        <TableCell>
                          {sub.user
                            ? [sub.user.profile?.firstName, sub.user.profile?.lastName].filter(Boolean).join(' ') || sub.user.mobileNumber || sub.user._id
                            : '-'}
                        </TableCell>
                      )}
                      <TableCell>
                        {plan?.name ?? sub.subscriptionType}
                        <br />
                        <Chip label={getTypeLabel(sub.subscriptionType)} size='small' variant='outlined' />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(sub.status)}
                          size='small'
                          color={sub.status === 'ACTIVE' ? 'success' : sub.status === 'EXPIRED' || sub.status === 'CANCELLED' ? 'default' : 'warning'}
                          variant='outlined'
                        />
                      </TableCell>
                      <TableCell>{formatDate(sub.startDate)}</TableCell>
                      <TableCell>{formatDate(sub.endDate)}</TableCell>
                      <TableCell>{formatPrice(sub.paymentAmount, sub.paymentCurrency)}</TableCell>
                      {isSuperAdmin && (
                        <TableCell>
                          Apps: {sub.applicationsCount ?? 0} · Interviews: {sub.interviewCallsUsed ?? 0}
                        </TableCell>
                      )}
                      {!isSuperAdmin && (
                        <TableCell align='right'>
                          {sub.status === 'ACTIVE' && (
                            <Button size='small' color='error' onClick={() => setCancelId(sub._id)}>
                              Cancel
                            </Button>
                          )}
                          {sub.status === 'PENDING_PAYMENT' && (
                            <Button size='small' component={Link} href={`/subscriptions/${sub._id}/activate`}>
                              Activate
                            </Button>
                          )}
                        </TableCell>
                      )}
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

  <Dialog open={!!cancelId} onClose={() => { setCancelId(null); setCancelReason('') }}>
    <DialogTitle>Cancel Subscription</DialogTitle>
    <DialogContent>
      <TextField
        fullWidth
        label='Reason (optional)'
        value={cancelReason}
        onChange={e => setCancelReason(e.target.value)}
        multiline
        rows={2}
        className='mte-2'
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={() => { setCancelId(null); setCancelReason('') }}>Cancel</Button>
      <Button variant='contained' color='error' onClick={handleCancel} disabled={isCancelling}>
        {isCancelling ? <CircularProgress size={24} /> : 'Cancel Subscription'}
      </Button>
    </DialogActions>
  </Dialog>
</Card>
  )
}

export default SubscriptionList
