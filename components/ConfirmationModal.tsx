

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { CloseIcon, ExclamationTriangleIcon } from '../icons/Icons';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'حذف',
    cancelText = 'إلغاء',
}) => {
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
        }, 300);
    };

    const handleConfirm = () => {
        onConfirm();
        handleClose();
    };

    if (!isOpen) return null;

    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;

    return ReactDOM.createPortal(
        <div
            className="fixed inset-0 z-[60] flex justify-center items-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirmation-title"
        >
            <div
                className={`fixed inset-0 bg-black/60 ${isClosing ? 'animate-backdrop-out' : 'animate-backdrop-in'}`}
                onClick={handleClose}
                aria-hidden="true"
            />
            <div
                className={`relative bg-white rounded-2xl shadow-xl w-full max-w-md m-4 p-6 text-center transform ${isClosing ? 'animate-modal-out' : 'animate-modal-in'} dark:bg-gray-800`}
            >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger/10">
                    <ExclamationTriangleIcon className="h-7 w-7 text-danger" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                    <h3 id="confirmation-title" className="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
                        {title}
                    </h3>
                    <div className="mt-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {message}
                        </p>
                    </div>
                </div>
                <div className="mt-5 sm:mt-6 flex flex-row-reverse gap-3">
                    <button
                        type="button"
                        className="btn btn-danger w-full"
                        onClick={handleConfirm}
                    >
                        {confirmText}
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary w-full"
                        onClick={handleClose}
                    >
                        {cancelText}
                    </button>
                </div>
            </div>
        </div>,
        modalRoot
    );
};

export default ConfirmationModal;
