// Next Imports
import type { ReactElement } from 'react'

// Component Imports
import UserForm from '@views/users/UserForm'

interface EditUserPageProps {
  params: Promise<{ id: string }>
}

const EditUserPage = async ({ params }: EditUserPageProps): Promise<ReactElement> => {
  const { id } = await params

  return <UserForm id={id} />
}

export default EditUserPage

