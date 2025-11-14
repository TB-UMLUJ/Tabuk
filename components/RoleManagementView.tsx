





import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Role, Permission } from '../types';
import { useToast } from '../contexts/ToastContext';
import { PlusIcon, PencilIcon, ShieldCheckIcon } from '../icons/Icons';
import AddEditRoleModal from './AddEditRoleModal';
import RolePermissionsModal from './RolePermissionsModal';

const roleNameMap: { [key: string]: string } = {
    'Admin': 'مسؤول النظام',
    'HR_Manager': 'مدير موارد بشرية',
    'User': 'مستخدم'
};

const RoleManagementView: React.FC = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
    const [roleToEdit, setRoleToEdit] = useState<Role | null>(null);
    const [roleForPermissions, setRoleForPermissions] = useState<Role | null>(null);
    const { addToast } = useToast();

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('roles')
                .select('*, role_permissions(permissions(*))')
                .order('role_id');
            if (error) throw error;
            setRoles(data || []);
        } catch (error: any) {
            addToast('خطأ', `فشل جلب الأدوار: ${error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAddRole = () => {
        setRoleToEdit(null);
        setIsAddEditModalOpen(true);
    };

    const handleEditRole = (role: Role) => {
        setRoleToEdit(role);
        setIsAddEditModalOpen(true);
    };

    const handleEditPermissions = (role: Role) => {
        setRoleForPermissions(role);
        setIsPermissionsModalOpen(true);
    };
    
    const handleSaveRole = async (roleData: { role_name: string; description: string; role_id?: number }): Promise<void> => {
        try {
            const { error } = await supabase.from('roles').upsert(roleData);
            if (error) throw error;
            addToast(`تم ${roleData.role_id ? 'تحديث' : 'إنشاء'} الدور بنجاح`, '', 'success');
            setIsAddEditModalOpen(false);
            fetchData();
        } catch (error: any) {
            addToast('خطأ', `فشل حفظ الدور: ${error.message}`, 'error');
            throw error;
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center py-20"><div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-primary dark:border-gray-700 dark:border-t-primary"></div></div>;
    }

    return (
        <div className="animate-fade-in relative">
            <div className="text-right mb-6">
                <button onClick={handleAddRole} className="p-2.5 rounded-lg inline-flex items-center justify-center transition-all duration-200 font-semibold bg-primary text-white hover:bg-primary-dark transform hover:-translate-y-0.5" title="إضافة دور جديد">
                    <PlusIcon className="h-5 w-5 ml-2" /> إضافة دور
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roles.map(role => (
                    <div key={role.role_id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-5 flex flex-col justify-between">
                        <div>
                            <h3 className="font-bold text-lg text-primary dark:text-primary-light">{roleNameMap[role.role_name] || role.role_name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 h-10">{role.description}</p>
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-xs font-semibold text-gray-400 mb-2 uppercase">الصلاحيات الممنوحة</p>
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                    {Array.isArray(role.role_permissions) && role.role_permissions.length > 0
                                        ? `${role.role_permissions.length} صلاحيات`
                                        : 'لا توجد صلاحيات'}
                                </div>
                            </div>
                        </div>
                        <div className="mt-5 flex items-center justify-end gap-2">
                            <button onClick={() => handleEditRole(role)} className="flex items-center gap-1 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light transition-colors py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                                <PencilIcon className="w-4 h-4" /> تعديل الاسم
                            </button>
                            <button onClick={() => handleEditPermissions(role)} className="flex items-center gap-1 text-sm font-semibold text-primary dark:text-primary-light hover:text-primary-dark dark:hover:text-white transition-colors py-2 px-3 rounded-md bg-primary/10 hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30">
                                <ShieldCheckIcon className="w-4 h-4" /> تعديل الصلاحيات
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <AddEditRoleModal
                isOpen={isAddEditModalOpen}
                onClose={() => setIsAddEditModalOpen(false)}
                onSave={handleSaveRole}
                roleToEdit={roleToEdit}
            />

            <RolePermissionsModal
                isOpen={isPermissionsModalOpen}
                onClose={() => setIsPermissionsModalOpen(false)}
                role={roleForPermissions}
                onSaveSuccess={fetchData}
            />
        </div>
    );
};

export default RoleManagementView;