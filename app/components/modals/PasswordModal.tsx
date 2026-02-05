import { X } from "lucide-react";
import {ReactNode, useEffect, useState} from "react";
import ReactPortal from "./ReactPortal";


interface PasswordModalProps {
    children: ReactNode;
    isOpen: boolean;
    handleClose: () => void;
}

const PasswordModal = ({
    children,
    isOpen,
    handleClose
}: PasswordModalProps) => {
    const [mounted, setMounted] = useState(false);
    
    useEffect(() => {
        setMounted(true);
        const closeOnEscapeKey = (e: KeyboardEvent) => 
            e.key === 'Escape' ? handleClose() : null;
        document.body.addEventListener('keydown', closeOnEscapeKey);
        return () => {
            document.body.removeEventListener('keydown', closeOnEscapeKey);
        };
    }, [handleClose]);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return (): void => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if(!isOpen || !mounted) return null;

    return (
        <ReactPortal wrapperId="react-portal-modal-container">
            <>
                <div className="fixed top-0 left-0 w-screen h-screen z-40 bg-neutral-800 opacity-50" onClick={handleClose}></div>
                <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-8 shadow-2xl transition-all">
                    <button onClick={handleClose} className="absolute right-4 top-4 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full p-1 transition-colors">
                        <X></X>
                    </button>
                    <div>{children}</div>
                </div>
            </>
        </ReactPortal>
    );
}

export default PasswordModal;