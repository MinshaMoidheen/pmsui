// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Grid from '@mui/material/Grid'



// Lazy load form components
const FormLayoutsBasic = dynamic(() => import('@views/form-layouts/FormLayoutsBasic'))
const FormLayoutsIcon = dynamic(() => import('@views/form-layouts/FormLayoutsIcons'))
const FormLayoutsAlignment = dynamic(() => import('@views/form-layouts/FormLayoutsAlignment'))

const FormLayouts = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12} md={6}>
        <FormLayoutsBasic />
      </Grid>
      <Grid item xs={12} md={6}>
        <FormLayoutsIcon />
      </Grid>
      <Grid item xs={12}>
        <FormLayoutsAlignment />
      </Grid>
    </Grid>
  )
}

export default FormLayouts
