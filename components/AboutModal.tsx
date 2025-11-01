import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { CloseIcon } from '../icons/Icons';
import { tabukHealthClusterLogoMain } from './Logo';

// Hardcoded metadata to prevent fetch errors on deployed environments.
const metadata = {
  "name": "تجمع تبوك الصحي",
  "description": "منصة ذكية موحدة لتجمع تبوك الصحي، تُمكّن من الوصول السريع إلى بيانات الموظفين وتحويلات المكاتب والمعاملات والتذكيرات، بما يعزز كفاءة التواصل والتنظيم الإداري."
};

interface AboutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
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
                className={`fixed inset-0 bg-black ${isClosing ? 'animate-backdrop-out' : 'animate-backdrop-in'}`}
                onClick={handleClose}
                aria-hidden="true"
            ></div>
            <div
                className={`relative bg-white rounded-2xl shadow-xl w-full max-w-md m-4 transform ${isClosing ? 'animate-modal-out' : 'animate-modal-in'} dark:bg-gray-800`}
            >
                <div className="p-6 md:p-8">
                    <button
                        onClick={handleClose}
                        className="absolute top-4 left-4 text-gray-400 hover:text-gray-800 transition-all duration-300 z-10 p-2 bg-gray-100/50 rounded-full dark:bg-gray-700/50 dark:text-gray-300 dark:hover:text-white hover:bg-gray-200/80 transform hover:rotate-90"
                    >
                        <CloseIcon className="w-6 h-6" />
                    </button>
                    <div className="text-center">
                         <img src={tabukHealthClusterLogoMain} alt="شعار تجمع تبوك الصحي" className="w-40 h-auto mx-auto mb-4" />
                        <div className="mb-4">
                            <p className="text-sm text-gray-500 font-semibold dark:text-gray-400">الإصدار 1.0.1</p>
                            <div className="mt-2 text-xs bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded-md p-2">
                                <p className="font-semibold">ما الجديد في هذا الإصدار:</p>
                                <p>تمت إضافة تحسينات عامة على الأداء.</p>
                            </div>
                        </div>
                        <p className="text-gray-600 bg-gray-50 p-4 rounded-lg text-base leading-relaxed mb-6 dark:bg-gray-700 dark:text-gray-300">
                            {metadata.description}
                        </p>
                        <a 
                            href="https://www.health.sa/ar"
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-block bg-primary text-white font-bold py-2.5 px-6 rounded-lg hover:bg-primary-dark transition-all duration-300 transform hover:-translate-y-0.5"
                        >
                            زيارة موقع وزارة الصحة
                        </a>
                    </div>
                </div>
            </div>
        </div>,
        modalRoot
    );
};

export default AboutModal;