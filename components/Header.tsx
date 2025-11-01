import React from 'react';
import { AdjustmentsVerticalIcon } from '../icons/Icons';
import { tabukHealthClusterLogoHeader } from './Logo';

interface HeaderProps {
    onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
    return (
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-gray-200 dark:bg-gray-900/80 dark:border-gray-700">
            <div className="container mx-auto px-4 py-3 md:px-6 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <img src={tabukHealthClusterLogoHeader} alt="Logo" className="h-10 sm:h-12 w-auto"/>
                    <div className="min-w-0">
                        <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 dark:text-white truncate">تجمع تبوك الصحي</h1>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onOpenSettings}
                        className="p-2.5 rounded-lg text-gray-500 hover:bg-primary/10 hover:text-primary transition-all duration-200 transform hover:-translate-y-0.5 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                        title="الإعدادات"
                        aria-label="الإعدادات"
                    >
                        <AdjustmentsVerticalIcon className="h-6 w-6" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;