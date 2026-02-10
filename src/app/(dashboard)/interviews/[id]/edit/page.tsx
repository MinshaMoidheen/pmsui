// Component Imports
import InterviewScheduleForm from '@/views/interview/InterviewScheduleForm'

interface EditInterviewSchedulePageProps {
  params: { id: string }
}

const EditInterviewSchedulePage = ({ params }: EditInterviewSchedulePageProps) => {
  const { id } = params

  return <InterviewScheduleForm id={id} />
}

export default EditInterviewSchedulePage
