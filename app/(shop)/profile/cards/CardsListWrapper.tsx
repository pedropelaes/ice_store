"use client"

import { useState } from 'react';
import PaymentMethodCard, { PaymentMethod } from '@/app/components/store/user/PaymentMethodCard';
import PasswordModal from '@/app/components/modals/PasswordModal';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { deletePaymentMethod } from '@/app/actions/paymentMethods';

export default function MethodsListWrapper({ initialMethods }: { initialMethods: PaymentMethod[] }) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [modalError, setModalError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [methodToDelete, setMethodToDelete] = useState<number | null>(null);

  const handleDeleteConfirm = async () => {
    if (!methodToDelete) return;

    setIsDeleting(true);
    setModalError("");

    try {
      const response = await deletePaymentMethod(methodToDelete);

      if (response.success) {
        setDeleteModalOpen(false);
        setMethodToDelete(null);
      } else {
        setModalError(response.error || "Ocorreu um erro ao excluir o cartão.");
      }
    } catch (error) {
      setModalError(`Falha de comunicação com o servidor. ${error}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {initialMethods.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500">Você ainda não tem métodos de pagamento salvos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {initialMethods.map((method) => (
            <PaymentMethodCard 
              key={method.id} 
              method={method} 
              onDelete={() => {
                setMethodToDelete(method.id);
                setDeleteModalOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {deleteModalOpen && (
        <PasswordModal
          isOpen={deleteModalOpen}
          handleClose={() => {
            setModalError("");
            setMethodToDelete(null);
            setDeleteModalOpen(false);
          }}
        >
          <div className="p-6 text-center sm:p-8">
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-red-100 mb-5">
              <AlertTriangle className="h-7 w-7 text-red-600" />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Excluir cartão
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Tem certeza que deseja remover este cartão? Você precisará inseri-lo novamente na próxima compra.
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
                className="w-full sm:w-auto px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors flex items-center justify-center min-w-30 disabled:bg-red-400 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Removendo...
                  </span>
                ) : (
                  "Sim, excluir"
                )}
              </button>
            </div>
          </div>
        </PasswordModal>
      )}
    </>
  );
}