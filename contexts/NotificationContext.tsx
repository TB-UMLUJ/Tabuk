import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { Notification, NotificationCategory } from '../types';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (title: string, message: string, category: NotificationCategory, link_id?: number) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const mockNotifications: Notification[] = [
    {
        id: 1,
        created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
        title: 'مهمة جديدة',
        message: 'تم إسناد مهمة "مراجعة تقرير الأداء" إليك.',
        category: 'task',
        is_read: false,
        link_id: 1,
    },
    {
        id: 2,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        title: 'معاملة جديدة',
        message: 'تم تسجيل معاملة واردة جديدة برقم THC-2024-001.',
        category: 'transaction',
        is_read: false,
        link_id: 1,
    },
     {
        id: 3,
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        title: 'تحديث النظام',
        message: 'تم تحديث النظام إلى الإصدار 1.1 بنجاح.',
        category: 'system',
        is_read: true,
    },
];

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const addNotification = useCallback((title: string, message: string, category: NotificationCategory, link_id?: number) => {
        const newNotification: Notification = {
            id: Date.now(),
            created_at: new Date().toISOString(),
            title,
            message,
            category,
            link_id,
            is_read: false,
        };
        setNotifications(prev => [newNotification, ...prev]);
    }, []);

    const markAsRead = useCallback((id: number) => {
        setNotifications(prev =>
            prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
        );
    }, []);

    const markAllAsRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    }, []);

    const value = {
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
    };

    return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};