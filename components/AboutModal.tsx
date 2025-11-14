import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { 
    CloseIcon, 
    SparklesIcon, 
    CheckCircleIcon,
    ShareIcon,
    XIcon,
    LinkedInIcon
} from '../icons/Icons';
import { useToast } from '../contexts/ToastContext';
import { useTheme } from '../contexts/ThemeContext';

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
    const { addToast } = useToast();
    const { logos } = useTheme();

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [isOpen]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300);
    };

    const handleShare = async () => {
        const shareData = {
            title: 'منصة تجمع تبوك الصحي',
            text: 'اكتشف منصة تجمع تبوك الصحي للوصول السريع إلى بيانات الموظفين، التحويلات، والمزيد!',
            url: 'https://tabuk-tau.vercel.app/'
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (error) {
                console.log('Share was cancelled or failed', error);
            }
        } else {
            try {
                await navigator.clipboard.writeText(shareData.url);
                addToast('تم نسخ رابط الموقع', '', 'info');
            } catch (err) {
                console.error('Failed to copy: ', err);
                addToast('خطأ', 'فشل نسخ الرابط.', 'error');
            }
        }
    };

    if (!isOpen) return null;

    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;

    return ReactDOM.createPortal(
        <div 
            className={`fixed inset-0 z-50 bg-gray-50 dark:bg-gray-900 overflow-y-auto ${isClosing ? 'animate-slide-out-left' : 'animate-slide-in-left'}`}
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
                    <img src={logos.mainLogoUrl} alt="شعار تجمع تبوك الصحي" className="w-40 h-auto mx-auto mb-4" />
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">{metadata.name}</h1>
                    <p className="mt-4 max-w-2xl mx-auto text-gray-600 dark:text-gray-400 text-base leading-relaxed">
                        {metadata.description}
                    </p>
                </div>

                {/* Footer Section */}
                <div className="text-center border-t border-gray-200 dark:border-gray-700 pt-8">
                     <div className="inline-flex items-center p-1.5 rounded-full bg-blue-100/60 dark:bg-gray-900/50 shadow-inner backdrop-blur-sm gap-2">
                        <a href="https://x.com/Tabuk_hc" target="_blank" rel="noopener noreferrer" aria-label="Follow us on X"
                           className="h-10 w-10 flex items-center justify-center bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                            <XIcon className="h-5 w-5 text-black dark:text-white"/>
                        </a>
                        <a href="https://www.linkedin.com/company/tabuk-health-cluster/" target="_blank" rel="noopener noreferrer" aria-label="Follow us on LinkedIn"
                           className="h-10 w-10 flex items-center justify-center bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                            <LinkedInIcon className="h-5 w-5 text-black dark:text-white"/>
                        </a>
                        <a href="https://www.health.sa/ar/Pages/default.aspx" target="_blank" rel="noopener noreferrer"
                           className="inline-flex items-center justify-center px-5 h-10 rounded-full bg-blue-600 text-white font-bold text-sm shadow-md hover:bg-blue-700 hover:-translate-y-0.5 transition-all">
                            تواصل معنا
                        </a>
                    </div>
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
