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
  useGetPropertiesQuery,
  useDeletePropertyMutation,
  type GetPropertiesParams
} from '@/store/services/propertiesApiSlice'

// Type Imports
import type { IProperty } from '@/types/properties'
import { PROPERTY_TYPES, PROPERTY_CATEGORIES } from '@/types/properties'

const PropertiesList = () => {
  const [page, setPage] = useState(0)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState('')
  const [type, setType] = useState<GetPropertiesParams['type']>(undefined)
  const [category, setCategory] = useState<GetPropertiesParams['category']>(undefined)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const params: GetPropertiesParams = {
    page: page + 1,
    limit,
    ...(search && { search }),
    ...(type && { type }),
    ...(category && { category })
  }

  const { data, isLoading, isError, error } = useGetPropertiesQuery(params)
  const [deleteProperty, { isLoading: isDeleting }] = useDeletePropertyMutation()

  const properties = data?.data?.properties ?? []
  const pagination = data?.data?.pagination
  const total = pagination?.total ?? 0

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteProperty(deleteId).unwrap()
      setDeleteId(null)
    } catch {
      // Error handled by mutation
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price)
  }

  const getCategoryLabel = (cat: string) => PROPERTY_CATEGORIES.find(c => c.value === cat)?.label ?? cat
  const getTypeLabel = (t: string) => PROPERTY_TYPES.find(pt => pt.value === t)?.label ?? t

  return (
    <Card>
      <CardHeader
        title='Properties'
        action={
          <Button variant='contained' component={Link} href='/properties/create' startIcon={<i className='ri-add-line' />}>
            Add Property
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
            select
            size='small'
            label='Type'
            value={type ?? ''}
            onChange={e => setType((e.target.value || undefined) as GetPropertiesParams['type'])}
            sx={{ minWidth: 120 }}
          >
            <MenuItem value=''>All</MenuItem>
            {PROPERTY_TYPES.map(pt => (
              <MenuItem key={pt.value} value={pt.value}>
                {pt.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size='small'
            label='Category'
            value={category ?? ''}
            onChange={e => setCategory((e.target.value || undefined) as GetPropertiesParams['category'])}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value=''>All</MenuItem>
            {PROPERTY_CATEGORIES.map(c => (
              <MenuItem key={c.value} value={c.value}>
                {c.label}
              </MenuItem>
            ))}
          </TextField>
        </div>

        {isError && (
          <Alert severity='error' className='mbe-4'>
            {(error as { data?: { message?: string } })?.data?.message ?? 'Failed to load properties'}
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
                    <TableCell>Type</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Area</TableCell>
                    <TableCell align='right'>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {properties.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align='center' className='py-8'>
                        No properties found
                      </TableCell>
                    </TableRow>
                  ) : (
                    properties.map((property: IProperty) => (
                      <TableRow key={property._id} hover>
                        <TableCell>{property.title}</TableCell>
                        <TableCell>
                          <Chip label={getTypeLabel(property.type)} size='small' variant='outlined' />
                        </TableCell>
                        <TableCell>{getCategoryLabel(property.category)}</TableCell>
                        <TableCell>
                          {property.location?.city}, {property.location?.state}
                        </TableCell>
                        <TableCell>{formatPrice(property.price)}</TableCell>
                        <TableCell>
                          {property.area?.value} {property.area?.unit}
                        </TableCell>
                        <TableCell align='right'>
                          <IconButton
                            size='small'
                            component={Link}
                            href={`/properties/${property._id}/edit`}
                            aria-label='Edit'
                          >
                            <i className='ri-pencil-line' />
                          </IconButton>
                          <IconButton size='small' onClick={() => setDeleteId(property._id)} aria-label='Delete' color='error'>
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
        <DialogTitle>Delete Property</DialogTitle>
        <DialogContent>Are you sure you want to delete this property?</DialogContent>
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

export default PropertiesList
