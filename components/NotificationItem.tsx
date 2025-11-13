
import React from 'react';
import { Notification, NotificationCategory } from '../types';
import { useNotifications } from '../contexts/NotificationContext';
import { BellIcon, ClipboardDocumentCheckIcon, DocumentDuplicateIcon, UserIcon, PhoneIcon } from '../icons/Icons';

interface NotificationItemProps {
    notification: Notification;
}

const timeSince = (dateString: string): string => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (isNaN(seconds) || seconds < 0) return 'الآن';
    let interval = seconds / 31536000;
    if (interval > 1) return `منذ ${Math.floor(interval)} سنة`;
    interval = seconds / 2592000;
    if (interval > 1) return `منذ ${Math.floor(interval)} شهر`;
    interval = seconds / 86400;
    if (interval > 1) return `منذ ${Math.floor(interval)} يوم`;
    interval = seconds / 3600;
    if (interval > 1) return `منذ ${Math.floor(interval)} ساعة`;
    interval = seconds / 60;
    if (interval > 1) return `منذ ${Math.floor(interval)} دقيقة`;
    return 'الآن';
};

const categoryIcons: Record<NotificationCategory, React.ReactNode> = {
    task: <ClipboardDocumentCheckIcon className="w-5 h-5 text-yellow-500" />,
    transaction: <DocumentDuplicateIcon className="w-5 h-5 text-purple-500" />,
    system: <BellIcon className="w-5 h-5 text-blue-500" />,
    employee: <UserIcon className="w-5 h-5 text-green-500" />,
    contact: <PhoneIcon className="w-5 h-5 text-secondary" />,
};

const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
    const { markAsRead } = useNotifications();

    const handleClick = () => {
        if (!notification.is_read) {
            markAsRead(notification.id);
        }
        // TODO: Handle navigation based on notification.link_id
    };

    return (
        <div
            onClick={handleClick}
            className="flex items-start gap-3 p-3 border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
        >
            {!notification.is_read && (
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-2.5 flex-shrink-0" title="غير مقروء"></div>
            )}
            <div className={`flex-shrink-0 ${notification.is_read ? 'ml-5' : ''}`}>
                {categoryIcons[notification.category]}
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-gray-800 dark:text-gray-200">{notification.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{notification.message}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{timeSince(notification.created_at)}</p>
            </div>
        </div>
    );
};

export default NotificationItem;