// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Grid from '@mui/material/Grid'



// Component Imports - lightweight components (eager)
import Award from '@views/dashboard/Award'
import Transactions from '@views/dashboard/Transactions'
import CardStatVertical from '@components/card-statistics/Vertical'

// Heavy components - lazy loaded for smaller initial bundle
const WeeklyOverview = dynamic(() => import('@views/dashboard/WeeklyOverview'))
const TotalEarning = dynamic(() => import('@views/dashboard/TotalEarning'))
const LineChart = dynamic(() => import('@views/dashboard/LineChart'))
const DistributedColumnChart = dynamic(() => import('@views/dashboard/DistributedColumnChart'))
const DepositWithdraw = dynamic(() => import('@views/dashboard/DepositWithdraw'))
const SalesByCountries = dynamic(() => import('@views/dashboard/SalesByCountries'))
const Table = dynamic(() => import('@views/dashboard/Table'))

const DashboardAnalytics = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12} md={4}>
        <Award />
      </Grid>
      <Grid item xs={12} md={8} lg={8}>
        <Transactions />
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <WeeklyOverview />
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <TotalEarning />
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <Grid container spacing={6}>
          <Grid item xs={12} sm={6}>
            <LineChart />
          </Grid>
          <Grid item xs={12} sm={6}>
            <CardStatVertical
              title='Total Profit'
              stats='$25.6k'
              avatarIcon='ri-pie-chart-2-line'
              avatarColor='secondary'
              subtitle='Weekly Profit'
              trendNumber='42%'
              trend='positive'
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <CardStatVertical
              stats='862'
              trend='negative'
              trendNumber='18%'
              title='New Project'
              subtitle='Yearly Project'
              avatarColor='primary'
              avatarIcon='ri-file-word-2-line'
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DistributedColumnChart />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <SalesByCountries />
      </Grid>
      <Grid item xs={12} lg={8}>
        <DepositWithdraw />
      </Grid>
      <Grid item xs={12}>
        <Table />
      </Grid>
    </Grid>
  )
}

export default DashboardAnalytics
