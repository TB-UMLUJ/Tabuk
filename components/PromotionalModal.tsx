import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { CloseIcon } from '../icons/Icons';
import { useTheme } from '../contexts/ThemeContext';

interface PromotionalModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PromotionalModal: React.FC<PromotionalModalProps> = ({ isOpen, onClose }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [dontShowAgain, setDontShowAgain] = useState(false);
    const { logos } = useTheme();

    const handleClose = useCallback(() => {
        if (dontShowAgain) {
            const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
            localStorage.setItem('promoModalDismissedToday', today);
        }
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 500); // Match animation duration
    }, [onClose, dontShowAgain]);

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


    if (!isOpen) {
        return null;
    }

    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;

    return ReactDOM.createPortal(
        <div
            className="fixed inset-0 z-50 flex justify-center items-center p-4"
            role="dialog"
            aria-modal="true"
        >
            <div
                className={`fixed inset-0 bg-black/60 ${isClosing ? 'animate-backdrop-out' : 'animate-backdrop-in'}`}
                aria-hidden="true"
            />
            <div
                className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md m-4 p-8 text-center transform ${isClosing ? 'animate-modal-out-scale' : 'animate-modal-in-scale'} dark:border dark:border-gray-700`}
            >
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-all duration-300 z-10 p-2 dark:text-gray-500 dark:hover:text-gray-300"
                    aria-label="إغلاق"
                >
                    <CloseIcon className="w-6 h-6" />
                </button>

                <img
                    src={logos.mainLogoUrl}
                    alt="شعار تجمع تبوك الصحي"
                    className="w-28 h-auto mx-auto mb-5"
                />

                <h2 className="text-sm sm:text-lg font-bold text-gray-800 dark:text-white mb-4 leading-relaxed">
                    تطوير إدارة الموارد البشرية بمستشفى أملج
                </h2>
                
                <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-lg mb-6">
                    <p className="text-sm font-semibold text-primary-dark dark:text-primary-light leading-relaxed">
                        المشروع قيد التطوير للمشاركة بجائزة الابتكار
                    </p>
                </div>


                <div className="flex items-center justify-center">
                    <input
                        id="dont-show-again"
                        type="checkbox"
                        checked={dontShowAgain}
                        onChange={(e) => setDontShowAgain(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor="dont-show-again" className="mr-2 block text-sm text-gray-700 dark:text-gray-300">
                        لا تظهر مرة أخرى اليوم
                    </label>
                </div>
            </div>
        </div>,
        modalRoot
    );
};

export default PromotionalModal;
