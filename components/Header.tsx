import React from 'react';
import { AdjustmentsVerticalIcon, SearchIcon } from '../icons/Icons';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';

interface HeaderProps {
    onOpenSettings: () => void;
    onOpenGlobalSearch: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenSettings, onOpenGlobalSearch }) => {
    const { logos } = useTheme();
    return (
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-gray-200 dark:bg-gray-900/80 dark:border-gray-700">
            <div className="container mx-auto px-3 py-2.5 md:px-6 flex justify-between items-center">
                <div>
                    <img src={logos.headerLogoUrl} alt="Logo" className="h-8 sm:h-9 w-auto"/>
                </div>
                <div className="flex items-center gap-2">
                     <button
                        onClick={onOpenGlobalSearch}
                        className="p-2.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-all duration-200 transform hover:-translate-y-0.5 dark:text-gray-400 dark:hover:bg-gray-700"
                        title="بحث شامل"
                        aria-label="بحث شامل"
                    >
                        <SearchIcon className="h-6 w-6" />
                    </button>
                    <ThemeToggle />
                    <button
                        onClick={onOpenSettings}
                        className="p-2.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-all duration-200 transform hover:-translate-y-0.5 dark:text-gray-400 dark:hover:bg-gray-700"
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