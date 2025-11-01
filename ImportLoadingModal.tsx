
import React from 'react';
import ReactDOM from 'react-dom';

interface ImportLoadingModalProps {
    isOpen: boolean;
}

const ImportLoadingModal: React.FC<ImportLoadingModalProps> = ({ isOpen }) => {
    if (!isOpen) return null;

    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;

    return ReactDOM.createPortal(
        <div
            className="fixed inset-0 z-[60] flex justify-center items-center p-4"
            role="dialog"
            aria-modal="true"
            aria-live="assertive"
        >
            <div className="fixed inset-0 bg-black/60 animate-backdrop-in" />
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm m-4 p-8 text-center animate-modal-in dark:bg-gray-800">
                <div className="h-16 w-16 mx-auto animate-spin rounded-full border-4 border-gray-200 border-t-primary dark:border-gray-700 dark:border-t-primary"></div>
                <h2 className="text-xl font-bold text-gray-800 mt-6 mb-2 dark:text-white">جاري استيراد البيانات</h2>
                <p className="text-gray-500 dark:text-gray-400">قد تستغرق هذه العملية بعض الوقت. يرجى الانتظار...</p>
            </div>
        </div>,
        modalRoot
    );
};

export default ImportLoadingModal;
