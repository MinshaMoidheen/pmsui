// Next Imports
import type { ReactElement } from 'react'

// Component Imports
import PropertyForm from '@views/properties/PropertyForm'

interface EditPropertyPageProps {
  params: Promise<{ id: string }>
}

const EditPropertyPage = async ({ params }: EditPropertyPageProps): Promise<ReactElement> => {
  const { id } = await params

  return <PropertyForm id={id} />
}

export default EditPropertyPage
