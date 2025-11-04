import React, { useState, useRef, useEffect } from 'react';
import { AdjustmentsVerticalIcon, BellIcon } from '../icons/Icons';
import { tabukHealthClusterLogoHeader } from './Logo';
import ThemeToggle from './ThemeToggle';
import { useNotifications } from '../contexts/NotificationContext';
import NotificationCenter from './NotificationCenter';

interface HeaderProps {
    onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
    const { unreadCount } = useNotifications();
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);

     useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setIsNotificationsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

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
                    <ThemeToggle />
                    <div className="relative" ref={notificationRef}>
                         <button
                            onClick={() => setIsNotificationsOpen(prev => !prev)}
                            className="relative p-2.5 rounded-lg text-gray-500 hover:bg-primary/10 hover:text-primary transition-all duration-200 transform hover:-translate-y-0.5 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                            title="الإشعارات"
                            aria-label="الإشعارات"
                        >
                            <BellIcon className="h-6 w-6" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 flex h-4 w-4">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-4 w-4 bg-danger text-white text-[10px] items-center justify-center font-bold">
                                        {unreadCount}
                                    </span>
                                </span>
                            )}
                        </button>
                        <NotificationCenter isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
                    </div>
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