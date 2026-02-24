"use client"

import { getUserAddresses } from "@/app/actions/adress";
import { useCheckout } from "@/app/context/CheckoutContext";
import { useEffect, useState } from "react";
import { ShippingOption, ShippingOptions } from "./ShippingOptions";
import { MapPin } from "lucide-react";
import { AddressForm } from "./AdressForm";


export function AddressStep() {
    const { deliveryData, setDeliveryData, setShippingFee, saveAddress, setSaveAddress } = useCheckout();
    const [selectedShippingId, setSelectedShippingId] = useState<number | null>(null);
    
      const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
      const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
      
      useEffect(() => {
        async function fetchAddresses() {
          const addresses = await getUserAddresses();
          setSavedAddresses(addresses);
          setIsLoadingAddresses(false);
          
          /*
          if (addresses.length > 0 && !deliveryData.cep) {
             handleSelectSavedAddress(addresses[0]);
          }
          */
        }
        fetchAddresses();
      }, []);
    
      const handleSelectSavedAddress = (addr: any) => {
        setDeliveryData({
          cep: addr.zip_code,
          street: addr.street,
          number: addr.number,
          complement: addr.complement || "",
          neighborhood: addr.neighborhood,
          city: addr.city,
          state: addr.state,
          recipientName: addr.recipient_name,
          phone: addr.phone,
          cpf: deliveryData.cpf
        });
        setSaveAddress(false); 
        setShippingFee(0);
        setSelectedShippingId(null);
      };
    
      const handleDeliveryChange = (field: keyof typeof deliveryData, value: string) => {
        setDeliveryData((prev) => ({ ...prev, [field]: value }));
      };
    
      const handleShippingSelect = (option: ShippingOption) => {
        setSelectedShippingId(option.id);
        setShippingFee(option.price); 
      };
      
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {!isLoadingAddresses && savedAddresses.length > 0 && (
            <div className="mb-8">
                <h3 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">Seus Endereços</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedAddresses.map((addr) => (
                    <div 
                    key={addr.id}
                    onClick={() => handleSelectSavedAddress(addr)}
                    className="border-2 border-gray-200 rounded-xl p-4 cursor-pointer hover:border-black hover:shadow-md transition-all group relative bg-white"
                    >
                    {addr.is_default && (
                        <span className="absolute top-4 right-4 bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded">Padrão</span>
                    )}
                    <div className="flex items-center gap-2 font-bold mb-1 text-black">
                        <MapPin size={16} className="text-gray-400 group-hover:text-black transition-colors" /> 
                        {addr.recipient_name}
                    </div>
                    <p className="text-sm text-gray-600">{addr.street}, {addr.number} {addr.complement && `- ${addr.complement}`}</p>
                    <p className="text-sm text-gray-600">{addr.city} - {addr.state}, {addr.zip_code}</p>
                    </div>
                ))}
                </div>
                <div className="flex items-center gap-4 my-6">
                    <div className="h-px bg-gray-300 flex-1"></div>
                    <span className="text-sm text-gray-400 font-medium">OU NOVO ENDEREÇO</span>
                    <div className="h-px bg-gray-300 flex-1"></div>
                </div>
            </div>
            )}

            <AddressForm 
            data={deliveryData} 
            onChange={handleDeliveryChange} 
            saveAddress={saveAddress}
            onSaveAddressChange={setSaveAddress}
            />
            
            <ShippingOptions 
                cep={deliveryData.cep} 
                selectedOptionId={selectedShippingId}
                onSelect={handleShippingSelect}
            />
        </div>
    )
}