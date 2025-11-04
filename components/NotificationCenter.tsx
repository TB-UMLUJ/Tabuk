import React from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import NotificationItem from './NotificationItem';
import { BellIcon } from '../icons/Icons';

interface NotificationCenterProps {
    isOpen: boolean;
    onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
    const { notifications, markAllAsRead, unreadCount } = useNotifications();

    if (!isOpen) {
        return null;
    }

    const handleMarkAll = (e: React.MouseEvent) => {
        e.stopPropagation();
        markAllAsRead();
    }

    return (
        <div
            className="fixed md:absolute top-[68px] md:top-full left-4 right-4 md:left-auto md:right-0 mt-0 md:mt-2 w-auto md:w-80 max-w-full md:max-w-sm z-40 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in"
        >
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="font-bold text-gray-800 dark:text-white">الإشعارات</h3>
                {unreadCount > 0 && (
                    <button onClick={handleMarkAll} className="text-xs font-semibold text-primary dark:text-primary-light hover:underline">
                        تمييز الكل كمقروء
                    </button>
                )}
            </div>

            <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                    notifications.map(notification => (
                        <NotificationItem key={notification.id} notification={notification} />
                    ))
                ) : (
                    <div className="text-center py-12 px-4 text-gray-500 dark:text-gray-400">
                        <BellIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
                        <p className="mt-2 font-semibold">لا توجد إشعارات جديدة</p>
                        <p className="text-sm">ستظهر إشعاراتك هنا عند وصولها.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationCenter;