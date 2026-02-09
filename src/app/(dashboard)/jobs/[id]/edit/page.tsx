// Next Imports
import type { ReactElement } from 'react'

// Component Imports
import JobForm from '@views/jobs/JobForm'

interface EditJobPageProps {
  params: Promise<{ id: string }>
}

const EditJobPage = async ({ params }: EditJobPageProps): Promise<ReactElement> => {
  const { id } = await params

  return <JobForm id={id} />
}

export default EditJobPage

