import React, { Fragment } from 'react'
import UserDetailsForm from '@/components/admin/users/userDetailForm';

const UserDetailsPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  
  return (
    <Fragment>
        <UserDetailsForm userId={id} />
    </Fragment>
  )
}

export default UserDetailsPage