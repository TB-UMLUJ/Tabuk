
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ActivityLog, ActionType, TargetType } from '../types';
import { useToast } from '../contexts/ToastContext';
import { SearchIcon, PlusIcon, PencilIcon, TrashIcon, CheckCircleIcon, ArrowPathIcon } from '../icons/Icons';

const timeSince = (dateString: string): string => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (isNaN(seconds) || seconds < 0) return 'الآن';

    let interval = seconds / 31536000;
    if (interval > 1) {
        const years = Math.floor(interval);
        return `منذ ${years} ${years === 2 ? 'سنتين' : years > 2 && years < 11 ? 'سنوات' : 'سنة'}`;
    }
    interval = seconds / 2592000;
    if (interval > 1) {
        const months = Math.floor(interval);
        return `منذ ${months} ${months === 2 ? 'شهرين' : months > 2 && months < 11 ? 'أشهر' : 'شهر'}`;
    }
    interval = seconds / 86400;
    if (interval > 1) {
        const days = Math.floor(interval);
        if (days === 1) return 'بالأمس';
        return `منذ ${days} ${days === 2 ? 'يومين' : days > 2 && days < 11 ? 'أيام' : 'يوم'}`;
    }
    interval = seconds / 3600;
    if (interval > 1) {
        const hours = Math.floor(interval);
        return `منذ ${hours} ${hours === 2 ? 'ساعتين' : hours > 2 && hours < 11 ? 'ساعات' : 'ساعة'}`;
    }
    interval = seconds / 60;
    if (interval > 1) {
        const minutes = Math.floor(interval);
        return `منذ ${minutes} ${minutes === 2 ? 'دقيقتين' : minutes > 2 && minutes < 11 ? 'دقائق' : 'دقيقة'}`;
    }
    return 'الآن';
};

const actionIcons: Record<ActionType, React.ReactNode> = {
    'إضافة': <PlusIcon className="w-5 h-5 text-green-600" />,
    'تعديل': <PencilIcon className="w-5 h-5 text-blue-600" />,
    'حذف': <TrashIcon className="w-5 h-5 text-red-600" />,
    'إكمال': <CheckCircleIcon className="w-5 h-5 text-purple-600" />,
    'إعادة فتح': <ArrowPathIcon className="w-5 h-5 text-yellow-600" />,
    'تحديث حالة': <PencilIcon className="w-5 h-5 text-indigo-600" />,
    'تسجيل دخول': <ArrowPathIcon className="w-5 h-5 text-green-600" />, // Placeholder
    'تسجيل خروج': <ArrowPathIcon className="w-5 h-5 text-red-600" />, // Placeholder
};

const actionTypes: ActionType[] = ['إضافة', 'تعديل', 'حذف', 'إكمال', 'إعادة فتح', 'تحديث حالة', 'تسجيل دخول', 'تسجيل خروج'];
const targetTypes: TargetType[] = ['موظف', 'مهمة', 'معاملة', 'تحويلة مكتب', 'مستخدم', 'النظام'];

const ActivityLogView: React.FC = () => {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ searchTerm: '', action: 'all', target: 'all' });
    const { addToast } = useToast();

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('activity_log')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(500);
                if (error) throw error;
                setLogs(data || []);
            } catch (error: any) {
                addToast('خطأ', 'فشل في تحميل سجل النشاط.', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, [addToast]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const searchTermMatch = filters.searchTerm === '' ||
                log.user_full_name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                log.description.toLowerCase().includes(filters.searchTerm.toLowerCase());
            
            const actionMatch = filters.action === 'all' || log.action_type === filters.action;
            const targetMatch = filters.target === 'all' || log.target_type === filters.target;

            return searchTermMatch && actionMatch && targetMatch;
        });
    }, [logs, filters]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-primary dark:border-gray-700 dark:border-t-primary"></div>
            </div>
        );
    }
    
    return (
        <div className="mt-6 animate-fade-in pb-24 md:pb-6">
            <div className="bg-white p-4 rounded-xl shadow-md mb-6 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div className="relative w-full md:col-span-1">
                        <input
                            type="text"
                            name="searchTerm"
                            placeholder="ابحث بالاسم أو الوصف..."
                            value={filters.searchTerm}
                            onChange={handleFilterChange}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                        </div>
                    </div>
                    <select name="action" value={filters.action} onChange={handleFilterChange} className="w-full py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <option value="all">كل الإجراءات</option>
                        {actionTypes.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                    <select name="target" value={filters.target} onChange={handleFilterChange} className="w-full py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <option value="all">كل الأنواع</option>
                        {targetTypes.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                </div>
            </div>

            <div className="space-y-3">
                {filteredLogs.length > 0 ? (
                    filteredLogs.map(log => (
                        <div key={log.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 flex items-start gap-4">
                            <div className="bg-gray-100 dark:bg-gray-700 p-2.5 rounded-full mt-1">
                                {actionIcons[log.action_type] || <PencilIcon className="w-5 h-5 text-gray-500"/>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-800 dark:text-gray-200">
                                    <span className="font-bold">{log.user_full_name}</span> {log.description}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {timeSince(log.created_at)}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 px-4 bg-gray-50 rounded-lg dark:bg-gray-800">
                        <p className="text-gray-500 dark:text-gray-400">لا توجد سجلات تطابق معايير التصفية.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityLogView;
