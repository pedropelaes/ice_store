"use client"

import { useState } from 'react';
import AddressCard from '@/app/components/store/user/AddressCard';
import PasswordModal from '@/app/components/modals/PasswordModal';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { deleteAddress } from '@/app/actions/adress';

export default function AddressListWrapper({ initialAddresses }: { initialAddresses: any[] }) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
   const [modalError, setModalError] = useState("");
   const [isDeleting, setIsDeleting] = useState(false);

   const [addressToDelete, setAddressToDelete] = useState<number | null>(null);

  const handleDeleteConfirm = async () => {
    if (!addressToDelete) return;

    setIsDeleting(true);
    setModalError("");

    try {
      const response = await deleteAddress(addressToDelete);

      if (response.success) {
        setDeleteModalOpen(false);
        setAddressToDelete(null);
      } else {
        setModalError(response.error || "Ocorreu um erro ao excluir o endereço.");
      }
    } catch (error) {
      setModalError("Falha de comunicação com o servidor.");
    } finally {
      setIsDeleting(false);
    }
  };
  return (
    <>
      {initialAddresses.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500">Você ainda não tem endereços cadastrados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {initialAddresses.map((address) => (
            <AddressCard key={address.id} address={address} 
                onEdit={() => {}}
                onDelete={() => {
                    setAddressToDelete(address.id); 
                    setDeleteModalOpen(true);
                }}
            />
          ))}
        </div>
      )}

        {deleteModalOpen &&
            <PasswordModal
            isOpen={deleteModalOpen}
            handleClose={() => {
                setModalError("");
                setDeleteModalOpen(!deleteModalOpen);
            }}
        >
            <div className="p-6 text-center sm:p-8">
                <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-red-100 mb-5">
                    <AlertTriangle className="h-7 w-7 text-red-600" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Excluir endereço
                </h3>
                <p className="text-sm text-gray-500 mb-8">
                    Tem certeza que deseja excluir este endereço? Esta ação não poderá ser desfeita e ele será removido da sua conta.
                </p>

                {modalError && (
                    <p className="text-sm text-red-600 font-medium bg-red-50 p-2 rounded-md mb-6">
                        {modalError}
                    </p>
                )}
                
                <div className="flex flex-col-reverse sm:flex-row justify-center gap-3">
                    <button
                    onClick={handleDeleteConfirm}
                    disabled={isDeleting}
                    className="w-full sm:w-auto px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors flex items-center justify-center min-w-[120px] disabled:bg-red-400 disabled:cursor-not-allowed"
                    >
                    {isDeleting ? (
                        <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Excluindo...
                        </span>
                    ) : (
                        "Sim, excluir"
                    )}
                    </button>
                </div>
                </div>
        </PasswordModal>

        }

    </>
  );
}