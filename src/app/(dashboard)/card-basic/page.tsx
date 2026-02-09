// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'



// Lazy load card components for smaller initial bundle
const CardInfluencingInfluencerWithImg = dynamic(() => import('@views/card-basic/CardInfluencingInfluencerWithImg'))
const CardUser = dynamic(() => import('@views/card-basic/CardUser'))
const CardWithCollapse = dynamic(() => import('@views/card-basic/CardWithCollapse'))
const CardMobile = dynamic(() => import('@views/card-basic/CardMobile'))
const CardHorizontalRatings = dynamic(() => import('@views/card-basic/CardHorizontalRatings'))
const CardWatch = dynamic(() => import('@views/card-basic/CardWatch'))
const CardLifetimeMembership = dynamic(() => import('@views/card-basic/CardLifetimeMembership'))
const CardInfluencingInfluencer = dynamic(() => import('@views/card-basic/CardInfluencingInfluencer'))
const CardVerticalRatings = dynamic(() => import('@views/card-basic/CardVerticalRatings'))
const CardSupport = dynamic(() => import('@views/card-basic/CardSupport'))
const CardWithTabs = dynamic(() => import('@views/card-basic/CardWithTabs'))
const CardWithTabsCenter = dynamic(() => import('@views/card-basic/CardWithTabsCenter'))
const CardTwitter = dynamic(() => import('@views/card-basic/CardTwitter'))
const CardFacebook = dynamic(() => import('@views/card-basic/CardFacebook'))
const CardLinkedIn = dynamic(() => import('@views/card-basic/CardLinkedIn'))

const CardBasic = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Typography variant='h3'>Basic Cards</Typography>
        <Divider />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <CardInfluencingInfluencerWithImg />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <CardUser />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <CardWithCollapse />
      </Grid>
      <Grid item xs={12} sm={6}>
        <CardMobile />
      </Grid>
      <Grid item xs={12} sm={6}>
        <CardHorizontalRatings />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <CardWatch />
      </Grid>
      <Grid item xs={12} md={8}>
        <CardLifetimeMembership />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <CardInfluencingInfluencer />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <CardVerticalRatings />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <CardSupport />
      </Grid>
      <Grid item xs={12}>
        <Typography variant='h3'>Navigation Cards</Typography>
        <Divider />
      </Grid>
      <Grid item xs={12} md={6}>
        <CardWithTabs />
      </Grid>
      <Grid item xs={12} md={6}>
        <CardWithTabsCenter />
      </Grid>
      <Grid item xs={12}>
        <Typography variant='h3'>Solid Cards</Typography>
        <Divider />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <CardTwitter />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <CardFacebook />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <CardLinkedIn />
      </Grid>
    </Grid>
  )
}

export default CardBasic
