import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { ExclamationTriangleIcon } from '../icons/Icons';

interface InactiveAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const InactiveAccountModal: React.FC<InactiveAccountModalProps> = ({ isOpen, onClose }) => {
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300); // Animation duration
    };

    if (!isOpen) return null;

    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;

    return ReactDOM.createPortal(
        <div
            className="fixed inset-0 z-[60] flex justify-center items-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="inactive-account-title"
        >
            <div
                className={`fixed inset-0 bg-black/60 ${isClosing ? 'animate-backdrop-out' : 'animate-backdrop-in'}`}
                onClick={handleClose}
                aria-hidden="true"
            />
            <div
                className={`relative bg-white rounded-2xl shadow-xl w-full max-w-md m-4 p-6 text-center transform ${isClosing ? 'animate-modal-out-scale' : 'animate-modal-in-scale'} dark:bg-gray-800`}
            >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
                    <ExclamationTriangleIcon className="h-7 w-7 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                    <h3 id="inactive-account-title" className="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
                        الحساب غير نشط
                    </h3>
                    <div className="mt-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            حسابك موجود ولكنه غير مفعل حالياً. يرجى التواصل مع قسم الدعم الفني أو مسؤول النظام لتفعيل حسابك.
                        </p>
                    </div>
                </div>
                <div className="mt-5 sm:mt-6">
                    <button
                        type="button"
                        className="btn btn-primary w-full"
                        onClick={handleClose}
                    >
                        حسنًا
                    </button>
                </div>
            </div>
        </div>,
        modalRoot
    );
};

export default InactiveAccountModal;
