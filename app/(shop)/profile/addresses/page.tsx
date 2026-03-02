import { getUserAddresses } from '@/app/actions/adress';
import { getAuthenticatedUser } from '@/app/lib/get-user';
import { redirect } from 'next/navigation';
import AddressListWrapper from './AddressListWrapper';

export default async function UserAddressesPage() {
  const authUser = await getAuthenticatedUser();
  if (!authUser) redirect('/auth/login');

  const addresses = await getUserAddresses();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <AddressListWrapper initialAddresses={addresses} />
    </div>
  );
}