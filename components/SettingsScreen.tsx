
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { CloseIcon, ChevronLeftIcon, ArrowRightOnRectangleIcon, KeyIcon, InformationCircleIcon, UsersIcon } from '../icons/Icons';
import AboutModal from './AboutModal';
import { useAuth } from '../contexts/AuthContext';
import ChangePasswordModal from './ChangePasswordModal';
import UserRoleManagementView from './UserRoleManagementView';

interface SettingsScreenProps {
    isOpen: boolean;
    onClose: () => void;
}

type SettingsView = 'main' | 'userRoleManagement';

const SettingsCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
    colorClass?: string;
}> = ({ icon, title, description, onClick, colorClass = 'text-primary dark:text-primary-light bg-primary/10 dark:bg-primary/20' }) => {
    return (
        <button
            onClick={onClick}
            className="w-full text-right p-5 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary-light hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-5"
        >
            <div className={`p-4 rounded-lg ${colorClass}`}>
                {icon}
            </div>
            <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-800 dark:text-white">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
            </div>
            <ChevronLeftIcon className="w-6 h-6 text-gray-400 dark:text-gray-500" />
        </button>
    );
};


const SettingsScreen: React.FC<SettingsScreenProps> = ({ isOpen, onClose }) => {
    const { logout, hasPermission } = useAuth();
    const [isClosing, setIsClosing] = useState(false);
    const [showAboutModal, setShowAboutModal] = useState(false);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [currentView, setCurrentView] = useState<SettingsView>('main');

    // Reset view to 'main' when the modal is reopened
    useEffect(() => {
        if (isOpen) {
            setCurrentView('main');
        }
    }, [isOpen]);

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

    const mainSettingsContent = (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <SettingsCard
                icon={<KeyIcon className="w-7 h-7" />}
                title="تغيير كلمة المرور"
                description="تحديث كلمة المرور لزيادة أمان حسابك."
                onClick={() => setShowChangePasswordModal(true)}
            />
            {hasPermission('manage_users') && (
                <SettingsCard
                    icon={<UsersIcon className="w-7 h-7" />}
                    title="إدارة المستخدمين والأدوار"
                    description="إضافة وتعديل المستخدمين وتحديد صلاحياتهم."
                    onClick={() => setCurrentView('userRoleManagement')}
                />
            )}
            <SettingsCard
                icon={<InformationCircleIcon className="w-7 h-7" />}
                title="حول التطبيق"
                description="معلومات الإصدار، الميزات الجديدة، وتفاصيل التطبيق."
                onClick={() => setShowAboutModal(true)}
            />
            <SettingsCard
                icon={<ArrowRightOnRectangleIcon className="w-7 h-7" />}
                title="تسجيل الخروج"
                description="إنهاء الجلسة الحالية والخروج من حسابك."
                onClick={logout}
                colorClass="text-danger dark:text-red-400 bg-danger/10 dark:bg-danger/20"
            />
        </div>
    );
    
    const viewTitles: Record<SettingsView, string> = {
        main: 'الإعدادات',
        userRoleManagement: 'إدارة المستخدمين والأدوار',
    };

    return ReactDOM.createPortal(
        <div 
            className={`fixed inset-0 z-50 bg-gray-50 dark:bg-gray-900 overflow-y-auto ${isOpen ? 'animate-slide-in-left' : 'animate-slide-out-left'}`}
            role="dialog"
            aria-modal="true"
        >
            <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200 dark:bg-gray-900/80 dark:border-gray-700">
                <div className="container mx-auto px-4 py-3 md:px-6 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                         {currentView !== 'main' && (
                            <button
                                onClick={() => setCurrentView('main')}
                                className="p-2.5 rounded-lg text-gray-500 hover:bg-primary/10 hover:text-primary transition-all duration-200"
                                aria-label="رجوع"
                            >
                                <ChevronLeftIcon className="h-6 w-6" />
                            </button>
                        )}
                        <h2 className="text-xl font-bold text-primary dark:text-white">
                            {viewTitles[currentView]}
                        </h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2.5 rounded-lg text-gray-500 hover:bg-primary/10 hover:text-primary transition-all duration-200 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                        aria-label="إغلاق"
                    >
                        <CloseIcon className="h-6 w-6" />
                    </button>
                </div>
            </header>

            <main className="container mx-auto p-4 md:p-6 pb-24 md:pb-6">
                {currentView === 'main' && mainSettingsContent}
                {currentView === 'userRoleManagement' && <UserRoleManagementView />}
            </main>

            <AboutModal isOpen={showAboutModal} onClose={() => setShowAboutModal(false)} />
            <ChangePasswordModal isOpen={showChangePasswordModal} onClose={() => setShowChangePasswordModal(false)} />
        </div>,
        modalRoot
    );
};

export default SettingsScreen;
