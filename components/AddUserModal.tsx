import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { User, Role } from '../types';
import { CloseIcon, UserPlusIcon, EyeIcon, EyeSlashIcon, InformationCircleIcon } from '../icons/Icons';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabaseClient';

interface AddUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (user: Partial<User> & { password?: string }) => Promise<void>;
    userToEdit: User | null;
    roles: Role[];
}

const initialUserState = {
    full_name: '',
    username: '',
    password: '',
    role_id: 0,
    is_active: true,
};

const roleDetailsMap: { [key: string]: { name: string; description: string } } = {
    'Admin': {
        name: 'مسؤول النظام',
        description: 'يمتلك صلاحية الوصول الكامل إلى جميع أجزاء النظام، بما في ذلك إدارة المستخدمين والصلاحيات.'
    },
    'HR_Manager': {
        name: 'مدير موارد بشرية',
        description: 'يمتلك صلاحيات لإدارة بيانات الموظفين، التوظيف، والرواتب. لا يمتلك صلاحيات إدارة النظام.'
    },
    'User': {
        name: 'مستخدم عادي',
        description: 'يمتلك صلاحيات محدودة مخصصة لعرض بعض البيانات أو تنفيذ مهام معينة.'
    }
};

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onSave, userToEdit, roles }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [userData, setUserData] = useState(initialUserState);
    const [showPassword, setShowPassword] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { addToast } = useToast();
    const isEditMode = !!userToEdit;

    useEffect(() => {
        if (userToEdit) {
            setUserData({
                full_name: userToEdit.full_name,
                username: userToEdit.username,
                password: '', // Password is not fetched for editing
                role_id: userToEdit.role.role_id,
                is_active: userToEdit.is_active,
            });
        } else {
            setUserData({ ...initialUserState, role_id: roles[0]?.role_id || 0 });
        }
    }, [userToEdit, roles]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setUserData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSaving) return;
        setIsSaving(true);

        try {
            const trimmedUsername = userData.username.trim();
            if (!trimmedUsername) {
                addToast('خطأ', 'اسم المستخدم حقل مطلوب.', 'error');
                setIsSaving(false);
                return;
            }

            const { data: existingUser } = await supabase
                .from('users')
                .select('user_id')
                .eq('username', trimmedUsername)
                .limit(1)
                .single();

            if (existingUser && (!isEditMode || existingUser.user_id !== userToEdit?.user_id)) {
                 addToast('اسم مستخدم موجود', 'اسم المستخدم هذا موجود بالفعل. الرجاء اختيار اسم آخر.', 'error');
                 setIsSaving(false);
                 return;
            }

            const dataToSave: Partial<User> & { password?: string } = {
                ...userData,
                username: trimmedUsername,
                full_name: userData.full_name.trim(),
                role_id: Number(userData.role_id),
            };

            if (isEditMode) {
                dataToSave.user_id = userToEdit.user_id;
                if (!dataToSave.password || dataToSave.password.trim() === '') {
                    delete dataToSave.password; // Don't send empty password if not changed
                }
            } else if (!dataToSave.password || dataToSave.password.trim() === '') {
                addToast('خطأ', 'كلمة المرور حقل مطلوب للمستخدمين الجدد.', 'error');
                setIsSaving(false);
                return;
            }

            await onSave(dataToSave);
        } catch (error) {
            // Error toast is shown by the parent component.
            // We just need to reset the loading state here.
            setIsSaving(false);
        }
    };


    if (!isOpen) return null;
    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;
    
    const selectedRoleInfo = roles.find(role => role.role_id === Number(userData.role_id));
    const arabicRoleDetails = selectedRoleInfo ? roleDetailsMap[selectedRoleInfo.role_name] : null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-50 flex justify-center items-center p-4" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-black/60" onClick={handleClose} />
            <div className={`relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto transform ${isClosing ? 'animate-modal-out' : 'animate-modal-in'} dark:bg-gray-800`}>
                <div className="p-6 md:p-8">
                     <button onClick={handleClose} className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-primary-light p-3 rounded-lg text-primary dark:bg-primary/20">
                            <UserPlusIcon className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-primary dark:text-white">{isEditMode ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}</h2>
                        </div>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الاسم الكامل</label>
                                <input name="full_name" value={userData.full_name} onChange={handleChange} required className="input-style" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اسم المستخدم</label>
                                <input name="username" value={userData.username} onChange={handleChange} required className="input-style" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                كلمة المرور {isEditMode ? '(اتركه فارغًا لعدم التغيير)' : ''}
                            </label>
                            <div className="relative">
                                <input name="password" type={showPassword ? 'text' : 'password'} value={userData.password} onChange={handleChange} required={!isEditMode} className="w-full input-style pr-10" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 left-0 px-3 flex items-center text-gray-500">
                                    {showPassword ? <EyeSlashIcon className="w-5 h-5"/> : <EyeIcon className="w-5 h-5"/>}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الدور</label>
                            <select name="role_id" value={userData.role_id} onChange={handleChange} required className="w-full input-style">
                                {roles.map(role => (
                                    <option key={role.role_id} value={role.role_id}>
                                        {roleDetailsMap[role.role_name]?.name || role.role_name}
                                    </option>
                                ))}
                            </select>
                            {arabicRoleDetails && arabicRoleDetails.description && (
                                <div className="mt-2 p-3 rounded-lg bg-amber-50 text-amber-900 dark:bg-amber-900/20 dark:text-amber-200 flex items-start gap-2.5 text-sm">
                                    <InformationCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-500 dark:text-amber-400" />
                                    <p>{arabicRoleDetails.description}</p>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center">
                            <input id="is_active" name="is_active" type="checkbox" checked={userData.is_active} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"/>
                            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                                الحساب نشط
                            </label>
                        </div>
                        <div className="mt-8 flex justify-end gap-3">
                            <button type="button" onClick={handleClose} className="btn-secondary">إلغاء</button>
                            <button type="submit" className="btn-primary" disabled={isSaving}>
                                {isSaving ? 'جاري الحفظ...' : isEditMode ? 'حفظ التغييرات' : 'إضافة مستخدم'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <style>{`
                .input-style {
                    background-color: #F9FAFB;
                    border: 1px solid #D1D5DB;
                    border-radius: 0.5rem;
                    padding: 0.75rem 1rem;
                    width: 100%;
                    outline: none;
                    color: #111827;
                }
                .input-style:focus {
                    --tw-ring-color: #005A9C;
                    box-shadow: 0 0 0 2px var(--tw-ring-color);
                }
                .dark .input-style {
                    background-color: #374151;
                    border-color: #4B5563;
                    color: white;
                }
                .btn-primary {
                    background-color: #005A9C;
                    color: white;
                    font-weight: 600;
                    padding: 0.5rem 1.5rem;
                    border-radius: 0.5rem;
                    transition: all 0.2s;
                    min-width: 7.5rem;
                }
                .btn-primary:hover {
                    background-color: #004B80;
                }
                 .btn-primary:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
                .btn-secondary {
                    background-color: #E5E7EB;
                    color: #1F2937;
                    font-weight: 600;
                    padding: 0.5rem 1.5rem;
                    border-radius: 0.5rem;
                    transition: all 0.2s;
                }
                .dark .btn-secondary {
                    background-color: #4B5563;
                    color: #D1D5DB;
                }
                .btn-secondary:hover {
                     background-color: #D1D5DB;
                }
                .dark .btn-secondary:hover {
                    background-color: #374151;
                }
            `}</style>
        </div>,
        modalRoot
    );
};

export default AddUserModal;