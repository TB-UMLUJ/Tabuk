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
                        className="btn btn-icon btn-secondary"
                        title="بحث شامل"
                        aria-label="بحث شامل"
                    >
                        <SearchIcon />
                    </button>
                    <ThemeToggle />
                    <button
                        onClick={onOpenSettings}
                        className="btn btn-icon btn-secondary"
                        title="الإعدادات"
                        aria-label="الإعدادات"
                    >
                        <AdjustmentsVerticalIcon />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
