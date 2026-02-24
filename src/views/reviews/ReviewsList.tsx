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
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Rating from '@mui/material/Rating'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'

// Store Imports
import { useGetAllReviewsQuery, useDeleteReviewMutation } from '@/store/services/reviewsApiSlice'

// Type Imports
import { IReview, ReviewTargetType } from '@/types/reviews'

const ReviewsList = () => {
  // States
  const [page, setPage] = useState(0)
  const [limit, setLimit] = useState(10)
  const [targetType, setTargetType] = useState<ReviewTargetType | ''>('')
  const [search, setSearch] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null)

  // Hooks
  const { data, isLoading, isError, error } = useGetAllReviewsQuery({
    targetType: targetType || undefined,
    search: search || undefined,
    page: page + 1,
    limit
  })

  const [deleteReview, { isLoading: isDeleting }] = useDeleteReviewMutation()

  const reviews = data?.data?.reviews ?? []
  const pagination = data?.data?.pagination
  const total = pagination?.total ?? 0

  const handleDeleteClick = (id: string) => {
    setSelectedReviewId(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (selectedReviewId) {
      try {
        await deleteReview({ reviewId: selectedReviewId }).unwrap()
        setDeleteDialogOpen(false)
        setSelectedReviewId(null)
      } catch (err) {
        console.error('Failed to delete review:', err)
      }
    }
  }

  const getTargetTypeColor = (type: ReviewTargetType) => {
    switch (type) {
      case 'PROPERTY':
        return 'primary'
      case 'JOB':
        return 'success'
      case 'AGENT':
        return 'warning'
      default:
        return 'default'
    }
  }

  return (
    <Card>
      <CardHeader title='Reviews' />
      <CardContent>
        <div className='flex flex-wrap gap-4 mbe-4'>
          <TextField
            size='small'
            placeholder='Search Reviewer/Target ID...'
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{ minWidth: 250 }}
          />

          <TextField
            select
            size='small'
            label='Target Type'
            value={targetType}
            onChange={e => setTargetType(e.target.value as ReviewTargetType | '')}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value=''>All Types</MenuItem>
            <MenuItem value='PROPERTY'>Property</MenuItem>
            <MenuItem value='JOB'>Job</MenuItem>
            <MenuItem value='AGENT'>Agent</MenuItem>
          </TextField>
        </div>

        {isError && (
          <Alert severity='error' className='mbe-4'>
            {(error as { data?: { message?: string } })?.data?.message ?? 'Failed to load reviews'}
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
                    <TableCell>Reviewer</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Rating</TableCell>
                    <TableCell>Comment</TableCell>
                    <TableCell>Created At</TableCell>
                    <TableCell align='right'>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reviews.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align='center' className='py-8'>
                        No reviews found
                      </TableCell>
                    </TableRow>
                  ) : (
                    reviews.map((review: IReview) => {
                      const reviewer = typeof review.reviewer === 'object' ? (review.reviewer as any) : null
                      const reviewerName = reviewer
                        ? `${reviewer.profile?.firstName ?? ''} ${reviewer.profile?.lastName ?? ''}`.trim() ||
                          'Unnamed User'
                        : (review.reviewer as string)

                      const target = typeof review.targetId === 'object' ? (review.targetId as any) : null
                      const targetTitle = target ? target.title || target.name || 'N/A' : (review.targetId as string)

                      return (
                        <TableRow key={review._id} hover>
                          <TableCell>
                            <Typography variant='body2' className='font-medium'>
                              {reviewerName}
                            </Typography>
                            <Typography variant='caption'>{targetTitle}</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={review.targetType}
                              color={getTargetTypeColor(review.targetType)}
                              size='small'
                              variant='outlined'
                            />
                          </TableCell>
                          <TableCell>
                            <Rating value={review.rating} readOnly size='small' />
                          </TableCell>
                          <TableCell sx={{ maxWidth: 300 }}>
                            <Typography variant='body2' className='line-clamp-2'>
                              {review.comment || 'No comment'}
                            </Typography>
                          </TableCell>
                          <TableCell>{new Date(review.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell align='right'>
                            <IconButton
                              size='small'
                              color='error'
                              onClick={() => handleDeleteClick(review._id)}
                              disabled={isDeleting}
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

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} aria-labelledby='delete-dialog-title'>
        <DialogTitle id='delete-dialog-title'>Delete Review</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this review? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} variant='outlined'>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color='error' variant='contained' autoFocus disabled={isDeleting}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default ReviewsList
