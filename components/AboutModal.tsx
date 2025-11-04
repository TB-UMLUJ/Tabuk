
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { 
    CloseIcon, 
    SparklesIcon, 
    CheckCircleIcon
} from '../icons/Icons';
import { tabukHealthClusterLogoMain } from './Logo';

// Hardcoded metadata to prevent fetch errors on deployed environments.
const metadata = {
  "name": "تجمع تبوك الصحي",
  "description": "منصة ذكية موحدة لتجمع تبوك الصحي، تُمكّن من الوصول السريع إلى بيانات الموظفين وتحويلات المكاتب والمعاملات والمهام، بما يعزز كفاءة التواصل والتنظيم الإداري."
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
            setIsClosing(false);
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [isOpen]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(onClose, 300);
    };

    if (!isOpen && !isClosing) return null;

    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;

    return ReactDOM.createPortal(
        <div 
            className={`fixed inset-0 z-50 bg-gray-50 dark:bg-gray-900 overflow-y-auto ${isOpen ? 'animate-slide-in-left' : 'animate-slide-out-left'}`}
            role="dialog"
            aria-modal="true"
        >
            <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200 dark:bg-gray-900/80 dark:border-gray-700">
                <div className="container mx-auto px-4 py-3 md:px-6 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-primary dark:text-white">حول التطبيق</h2>
                    <button
                        onClick={handleClose}
                        className="p-2.5 rounded-lg text-gray-500 hover:bg-primary/10 hover:text-primary transition-all duration-200 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                        aria-label="إغلاق"
                    >
                        <CloseIcon className="h-6 w-6" />
                    </button>
                </div>
            </header>

            <main className="container mx-auto p-4 md:p-6 pb-24">
                {/* Hero Section */}
                <div className="text-center mb-10">
                    <img src={tabukHealthClusterLogoMain} alt="شعار تجمع تبوك الصحي" className="w-40 h-auto mx-auto mb-4" />
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">{metadata.name}</h1>
                    <p className="mt-4 max-w-2xl mx-auto text-gray-600 dark:text-gray-400 text-base leading-relaxed">
                        {metadata.description}
                    </p>
                </div>

                {/* What's New Section */}
                <div className="mb-10">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <SparklesIcon className="w-6 h-6 text-yellow-500"/>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white text-center">
                            ما الجديد في هذا الإصدار
                            <span className="mr-2 bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light text-xs font-semibold px-3 py-1 rounded-full align-middle">
                                1.0.3
                            </span>
                        </h3>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <CheckCircleIcon className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                                <p className="text-gray-700 dark:text-gray-300">تصميم عصري وجذاب لواجهة "حول التطبيق".</p>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircleIcon className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                                <p className="text-gray-700 dark:text-gray-300">تحسين سرعة تحميل قائمة الموظفين عند التمرير.</p>
                            </li>
                             <li className="flex items-start gap-3">
                                <CheckCircleIcon className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                                <p className="text-gray-700 dark:text-gray-300">إصلاحات أخطاء وتحسينات عامة في أداء التطبيق.</p>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="text-center border-t border-gray-200 dark:border-gray-700 pt-8">
                     <a 
                        href="https://www.health.sa/ar"
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-block bg-primary text-white font-bold py-2.5 px-6 rounded-lg hover:bg-primary-dark transition-all duration-300 transform hover:-translate-y-0.5"
                    >
                        زيارة موقع تجمع تبوك الصحي
                    </a>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-6">
                        &copy; {new Date().getFullYear()} تجمع تبوك الصحي. جميع الحقوق محفوظة.
                    </p>
                </div>
            </main>
        </div>,
        modalRoot
    );
};

export default AboutModal;
