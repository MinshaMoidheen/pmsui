// Next Imports
import type { ReactElement } from 'react'

// Component Imports
import JobApplyForm from '@views/jobs/JobApplyForm'

interface ApplyJobPageProps {
  params: Promise<{ id: string }>
}

const ApplyJobPage = async ({ params }: ApplyJobPageProps): Promise<ReactElement> => {
  const { id } = await params

  return <JobApplyForm id={id} />
}

export default ApplyJobPage

