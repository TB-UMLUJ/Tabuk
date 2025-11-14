
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { supabase } from '../lib/supabaseClient';
import { User } from '../types';
import { CloseIcon, UserIcon, ShieldCheckIcon } from '../icons/Icons';
import { useToast } from '../contexts/ToastContext';

interface UserDetailModalProps {
    userId: number;
    onClose: () => void;
}

const roleNameMap: { [key: string]: string } = {
    'Admin': 'مسؤول النظام',
    'HR_Manager': 'مدير موارد بشرية',
    'User': 'مستخدم'
};

const UserDetailModal: React.FC<UserDetailModalProps> = ({ userId, onClose }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('users')
                    .select('*, role:roles(*)')
                    .eq('user_id', userId)
                    .single();

                if (error) throw error;
                setUser(data as any);
            } catch (error: any) {
                addToast('خطأ', `فشل جلب بيانات المستخدم: ${error.message}`, 'error');
                handleClose();
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [userId]);
    
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'auto'; };
    }, []);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    const InfoRow: React.FC<{ label: string; value: string | undefined; icon: React.ReactNode }> = ({ label, value, icon }) => {
        if (!value) return null;
        return (
            <div className="flex items-start gap-4 py-3">
                <div className="bg-primary/10 p-2.5 rounded-lg text-primary dark:bg-primary/20 dark:text-primary mt-1">{icon}</div>
                <div>
                    <p className="text-sm text-gray-500 font-medium dark:text-gray-400">{label}</p>
                    <p className="text-base font-bold text-gray-800 dark:text-white break-all">{value}</p>
                </div>
            </div>
        );
    };

    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[65] flex justify-center items-center p-4" role="dialog" aria-modal="true">
            <div
                className={`fixed inset-0 bg-black/60 ${isClosing ? 'animate-backdrop-out' : 'animate-backdrop-in'}`}
                onClick={handleClose}
                aria-hidden="true"
            />
            <div
                className={`relative bg-white rounded-2xl shadow-xl w-full max-w-lg transform ${isClosing ? 'animate-modal-out' : 'animate-modal-in'} dark:bg-gray-800`}
            >
                <div className="p-6 md:p-8">
                    <button onClick={handleClose} className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                    {loading ? (
                         <div className="flex flex-col items-center justify-center h-48">
                            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-primary dark:border-gray-700 dark:border-t-primary"></div>
                             <p className="mt-4 text-gray-500 dark:text-gray-400">جاري تحميل بيانات المستخدم...</p>
                        </div>
                    ) : user ? (
                        <div>
                             <div className="flex items-center gap-4 mb-6">
                                <div className="bg-primary-light p-3 rounded-lg text-primary dark:bg-primary/20">
                                    <UserIcon className="w-8 h-8" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-primary dark:text-white">{user.full_name}</h2>
                                    <p className="text-gray-500 dark:text-gray-400">@{user.username}</p>
                                </div>
                            </div>
                            <div className="border-t border-gray-200 pt-2 dark:border-gray-700">
                                <InfoRow label="الاسم الكامل" value={user.full_name} icon={<UserIcon className="w-5 h-5"/>} />
                                <InfoRow label="الدور" value={roleNameMap[user.role?.role_name] || user.role?.role_name} icon={<ShieldCheckIcon className="w-5 h-5"/>} />
                                 <InfoRow label="الحالة" value={user.is_active ? 'نشط' : 'غير نشط'} icon={<ShieldCheckIcon className="w-5 h-5"/>} />
                            </div>
                             <div className="mt-6 flex justify-end">
                                <button onClick={handleClose} className="bg-gray-200 text-gray-800 font-semibold py-2 px-6 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
                                    إغلاق
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p>لم يتم العثور على المستخدم.</p>
                    )}
                </div>
            </div>
        </div>,
        modalRoot
    );
};

export default UserDetailModal;