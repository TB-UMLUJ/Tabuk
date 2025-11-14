import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useToast } from '../contexts/ToastContext';
import { ActivityLog as Log, User } from '../types';
import { 
    UserIcon, 
    ClockIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    ArrowUpTrayIcon,
    ArrowRightOnRectangleIcon,
    ArrowLeftOnRectangleIcon
} from '../icons/Icons';
import UserDetailModal from './UserDetailModal';

const actionTranslations: Record<string, string> = {
    LOGIN: 'سجل الدخول',
    LOGOUT: 'سجل الخروج',
    CREATE_EMPLOYEE: 'أضاف موظفًا جديدًا',
    UPDATE_EMPLOYEE: 'حدّث بيانات موظف',
    DELETE_EMPLOYEE: 'حذف موظف',
    IMPORT_EMPLOYEES: 'استورد بيانات الموظفين',
    CREATE_CONTACT: 'أضاف جهة اتصال جديدة',
    UPDATE_CONTACT: 'حدّث بيانات جهة اتصال',
    DELETE_CONTACT: 'حذف جهة اتصال',
    IMPORT_CONTACTS: 'استورد بيانات جهات الاتصال',
    CREATE_TASK: 'أنشأ مهمة جديدة',
    UPDATE_TASK: 'حدّث مهمة',
    DELETE_TASK: 'حذف مهمة',
    COMPLETE_TASK: 'أكمل مهمة',
    CREATE_TRANSACTION: 'أنشأ معاملة جديدة',
    UPDATE_TRANSACTION: 'حدّث معاملة',
    DELETE_TRANSACTION: 'حذف معاملة',
    UPDATE_TRANSACTION_STATUS: 'حدّث حالة معاملة',
};

const formatLogDetails = (action: string, details: any): string => {
    if (!details || Object.keys(details).length === 0) return '';
    switch (action) {
        case 'UPDATE_EMPLOYEE':
        case 'CREATE_EMPLOYEE':
        case 'DELETE_EMPLOYEE':
            return `: ${details.employeeName || 'غير متوفر'}`;
        case 'IMPORT_EMPLOYEES':
            return `: ${details.count} موظف`;
        case 'UPDATE_CONTACT':
        case 'CREATE_CONTACT':
        case 'DELETE_CONTACT':
            return `: ${details.contactName || 'غير متوفر'}`;
        case 'IMPORT_CONTACTS':
            return `: ${details.count} جهة اتصال`;
        case 'UPDATE_TASK':
        case 'CREATE_TASK':
        case 'DELETE_TASK':
        case 'COMPLETE_TASK':
            return `: "${details.taskTitle || 'غير متوفر'}"`;
        case 'UPDATE_TRANSACTION':
        case 'CREATE_TRANSACTION':
            return `: "${details.transactionSubject || 'غير متوفر'}"`;
        case 'DELETE_TRANSACTION':
             return ` برقم: ${details.transactionNumber || 'غير متوفر'}`;
        case 'UPDATE_TRANSACTION_STATUS':
             return `: "${details.transactionSubject}" إلى حالة "${details.newStatus}"`;
        default:
            return '';
    }
};

const getActionAppearance = (action: string) => {
    const actionPrefix = action.split('_')[0];
    switch (actionPrefix) {
        case 'CREATE':
        case 'COMPLETE':
            return {
                icon: <PlusIcon className="w-5 h-5" />,
                className: 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400'
            };
        case 'UPDATE':
            return {
                icon: <PencilIcon className="w-5 h-5" />,
                className: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
            };
        case 'DELETE':
            return {
                icon: <TrashIcon className="w-5 h-5" />,
                className: 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400'
            };
        case 'IMPORT':
            return {
                icon: <ArrowUpTrayIcon className="w-5 h-5" />,
                className: 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400'
            };
        case 'LOGIN':
            return {
                icon: <ArrowRightOnRectangleIcon className="w-5 h-5" />,
                className: 'bg-teal-100 text-teal-600 dark:bg-teal-900/50 dark:text-teal-400'
            };
        case 'LOGOUT':
            return {
                icon: <ArrowLeftOnRectangleIcon className="w-5 h-5" />,
                className: 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
            };
        default:
            return {
                icon: <UserIcon className="w-5 h-5" />,
                className: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
            };
    }
};


const ActivityLogView: React.FC = () => {
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<Pick<User, 'user_id' | 'full_name'>[]>([]);
    const [selectedFilterUserId, setSelectedFilterUserId] = useState<string>('all');
    const { addToast } = useToast();
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { data, error } = await supabase
                    .from('users')
                    .select('user_id, full_name')
                    .order('full_name', { ascending: true });
                if (error) throw error;
                setUsers(data || []);
            } catch (error: any) {
                addToast('خطأ', `فشل جلب المستخدمين: ${error.message}`, 'error');
            }
        };
        fetchUsers();
    }, [addToast]);
    
    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            try {
                let query = supabase
                    .from('activity_log')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(100);

                if (selectedFilterUserId !== 'all') {
                    query = query.eq('user_id', selectedFilterUserId);
                }

                const { data, error } = await query;
                if (error) throw error;
                setLogs(data || []);
            } catch (error: any) {
                addToast('خطأ', `فشل تحميل السجل: ${error.message}`, 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [selectedFilterUserId, addToast]);


    return (
        <div className="animate-fade-in">
             <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                <label htmlFor="user-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    فرز بحسب المستخدم
                </label>
                <select
                    id="user-filter"
                    value={selectedFilterUserId}
                    onChange={(e) => setSelectedFilterUserId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                    <option value="all">جميع المستخدمين</option>
                    {users.map(user => (
                        <option key={user.user_id} value={user.user_id}>
                            {user.full_name}
                        </option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20"><div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-primary dark:border-gray-700 dark:border-t-primary"></div></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {logs.length > 0 ? logs.map(log => {
                        const { icon, className } = getActionAppearance(log.action);
                        return (
                            <div key={log.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4 flex items-start gap-4 hover:border-primary/50 dark:hover:border-primary-light/50 transition-colors">
                                <span className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${className}`}>
                                    {icon}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-900 dark:text-white break-words">
                                        <button
                                            onClick={() => setSelectedUserId(log.user_id)}
                                            className="font-bold hover:underline focus:outline-none text-primary dark:text-primary-light"
                                        >
                                            {log.user_full_name}
                                        </button>
                                        {' '}
                                        {actionTranslations[log.action] || log.action}
                                        <span className="text-gray-600 dark:text-gray-300">{formatLogDetails(log.action, log.details)}</span>
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 flex items-center gap-1.5">
                                        <ClockIcon className="w-4 h-4"/>
                                        {new Date(log.created_at).toLocaleString('ar-SA', { dateStyle: 'medium', timeStyle: 'short' })}
                                    </p>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="md:col-span-2 py-8 text-center text-gray-500 dark:text-gray-400">
                            {selectedFilterUserId === 'all' ? 'لا توجد نشاطات مسجلة بعد.' : 'لا توجد نشاطات مسجلة لهذا المستخدم.'}
                        </div>
                    )}
                </div>
            )}
            {selectedUserId && (
                <UserDetailModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
            )}
        </div>
    );
};

export default ActivityLogView;