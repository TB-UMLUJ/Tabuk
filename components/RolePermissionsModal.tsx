import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { supabase } from '../lib/supabaseClient';
import { Role, Permission } from '../types';
import { useToast } from '../contexts/ToastContext';
import { CloseIcon, ShieldCheckIcon } from '../icons/Icons';

interface RolePermissionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    role: Role | null;
    onSaveSuccess: () => void;
}

const permissionNameMap: { [key: string]: string } = {
    'manage_users': 'إدارة المستخدمين والأدوار',
    'edit_employees': 'إضافة وتعديل الموظفين',
    'delete_employees': 'حذف الموظفين',
    'import_export_employees': 'استيراد وتصدير الموظفين',
    'edit_contacts': 'إضافة وتعديل التحويلات',
    'delete_contacts': 'حذف التحويلات',
    'import_export_contacts': 'استيراد وتصدير التحويلات',
    'add_task': 'إضافة مهام',
    'edit_tasks': 'تعديل أي مهمة',
    'delete_tasks': 'حذف أي مهمة',
    'add_transaction': 'إضافة معاملات',
    'edit_transactions': 'تعديل أي معاملة',
    'delete_transactions': 'حذف أي معاملة',
};

const RolePermissionsModal: React.FC<RolePermissionsModalProps> = ({ isOpen, onClose, role, onSaveSuccess }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
    const [selectedPermissions, setSelectedPermissions] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            if (!isOpen) return;
            setLoading(true);
            try {
                const { data, error } = await supabase.from('permissions').select('*');
                if (error) throw error;
                setAllPermissions(data || []);
                const perms = role?.role_permissions;
                const initialSelected = new Set(
                    Array.isArray(perms) ? perms.map((rp: any) => rp.permissions.permission_id) : []
                );
                setSelectedPermissions(initialSelected);
            } catch (error: any) {
                addToast('خطأ', `فشل تحميل الصلاحيات: ${error.message}`, 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [isOpen, role, addToast]);

    const groupedPermissions = useMemo(() => {
        const groups: Record<string, Permission[]> = {
            'المستخدمين والأدوار': [],
            'الموظفين': [],
            'تحويلات المكاتب': [],
            'المهام': [],
            'المعاملات': [],
        };
        allPermissions.forEach(p => {
            if (p.permission_name.includes('user')) groups['المستخدمين والأدوار'].push(p);
            else if (p.permission_name.includes('employee')) groups['الموظفين'].push(p);
            else if (p.permission_name.includes('contact')) groups['تحويلات المكاتب'].push(p);
            else if (p.permission_name.includes('task')) groups['المهام'].push(p);
            else if (p.permission_name.includes('transaction')) groups['المعاملات'].push(p);
        });
        return groups;
    }, [allPermissions]);
    
    const handleTogglePermission = (permissionId: number) => {
        setSelectedPermissions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(permissionId)) {
                newSet.delete(permissionId);
            } else {
                newSet.add(permissionId);
            }
            return newSet;
        });
    };

    const handleClose = () => {
        if (isSaving) return;
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300);
    };

    const handleSave = async () => {
        if (!role) return;
        setIsSaving(true);
        try {
            const { error: deleteError } = await supabase.from('role_permissions').delete().eq('role_id', role.role_id);
            if (deleteError) throw deleteError;

            if (selectedPermissions.size > 0) {
                const newPermissions = Array.from(selectedPermissions).map(pid => ({ role_id: role.role_id, permission_id: pid }));
                const { error: insertError } = await supabase.from('role_permissions').insert(newPermissions);
                if (insertError) throw insertError;
            }
            addToast('تم تحديث الصلاحيات بنجاح', '', 'success');
            onSaveSuccess();
            handleClose();
        } catch (error: any) {
            addToast('خطأ', `فشل حفظ الصلاحيات: ${error.message}`, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;
    
    return ReactDOM.createPortal(
         <div className="fixed inset-0 z-[60] flex justify-center items-center p-4" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-black/60" onClick={handleClose} />
            <div className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col transform ${isClosing ? 'animate-modal-out' : 'animate-modal-in'}`}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <button onClick={handleClose} className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">تعديل صلاحيات دور: <span className="text-primary">{role?.role_name}</span></h2>
                </div>
                
                <div className="p-6 overflow-y-auto flex-grow">
                    {loading ? <p>جاري التحميل...</p> : (
                        <div className="space-y-6">
                            {/* FIX: Add Array.isArray check to ensure 'permissions' is an array before accessing .length or .map */}
                            {Object.entries(groupedPermissions).map(([groupName, permissions]) => Array.isArray(permissions) && permissions.length > 0 && (
                                <div key={groupName}>
                                    <h3 className="font-semibold text-lg text-gray-700 dark:text-gray-200 mb-3 border-r-4 border-primary pr-2">{groupName}</h3>
                                    <div className="space-y-3">
                                        {permissions.map(p => (
                                            <label key={p.permission_id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedPermissions.has(p.permission_id)}
                                                    onChange={() => handleTogglePermission(p.permission_id)}
                                                    className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary focus:ring-2"
                                                />
                                                <span className="font-medium text-gray-800 dark:text-gray-200">{permissionNameMap[p.permission_name] || p.permission_name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 flex-shrink-0">
                    <button onClick={handleClose} className="btn-secondary">إلغاء</button>
                    <button onClick={handleSave} className="btn-primary" disabled={isSaving}>
                        {isSaving ? 'جاري الحفظ...' : 'حفظ الصلاحيات'}
                    </button>
                </div>
            </div>
             <style>{`
                .btn-primary { background-color: #008755; color: white; font-weight: 600; padding: 0.5rem 1.5rem; border-radius: 0.5rem; transition: all 0.2s; min-width: 120px; }
                .btn-primary:hover { background-color: #006640; }
                .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
                .btn-secondary { background-color: #E5E7EB; color: #1F2937; font-weight: 600; padding: 0.5rem 1.5rem; border-radius: 0.5rem; transition: all 0.2s; }
                .dark .btn-secondary { background-color: #4B5563; color: #D1D5DB; }
                .btn-secondary:hover { background-color: #D1D5DB; }
                .dark .btn-secondary:hover { background-color: #374151; }
            `}</style>
        </div>,
        document.getElementById('modal-root')!
    );
};

export default RolePermissionsModal;