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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Seus Endereços</h1>
      </div>

      <AddressListWrapper initialAddresses={addresses} />
    </div>
  );
}