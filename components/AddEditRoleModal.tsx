import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Role } from '../types';
import { CloseIcon, ShieldCheckIcon } from '../icons/Icons';

interface AddEditRoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (roleData: { role_name: string, description: string, role_id?: number }) => Promise<void>;
    roleToEdit: Role | null;
}

const AddEditRoleModal: React.FC<AddEditRoleModalProps> = ({ isOpen, onClose, onSave, roleToEdit }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [roleData, setRoleData] = useState({ role_name: '', description: '' });
    const [isSaving, setIsSaving] = useState(false);
    const isEditMode = !!roleToEdit;

    useEffect(() => {
        if (roleToEdit) {
            setRoleData({ role_name: roleToEdit.role_name, description: roleToEdit.description || '' });
        } else {
            setRoleData({ role_name: '', description: '' });
        }
    }, [roleToEdit, isOpen]);

    const handleClose = () => {
        if (isSaving) return;
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setRoleData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSaving) return;
        setIsSaving(true);
        try {
            await onSave({ ...roleData, role_id: roleToEdit?.role_id });
        } catch (error) {
            // Error is handled by parent, just need to stop loading
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[55] flex justify-center items-center p-4" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-black/60" onClick={handleClose} />
            <div className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg transform ${isClosing ? 'animate-modal-out' : 'animate-modal-in'}`}>
                <div className="p-6 md:p-8">
                     <button onClick={handleClose} className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-lg text-primary dark:text-primary-light">
                            <ShieldCheckIcon className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-primary dark:text-white">{isEditMode ? 'تعديل الدور' : 'إضافة دور جديد'}</h2>
                        </div>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اسم الدور (باللغة الإنجليزية)</label>
                            <input name="role_name" value={roleData.role_name} onChange={handleChange} required className="input-style" placeholder="e.g., HR_Manager" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الوصف (باللغة العربية)</label>
                            <textarea name="description" value={roleData.description} onChange={handleChange} rows={2} className="input-style" placeholder="وصف موجز لصلاحيات هذا الدور..."/>
                        </div>
                        <div className="mt-8 flex justify-end gap-3">
                            <button type="button" onClick={handleClose} className="btn-secondary">إلغاء</button>
                            <button type="submit" className="btn-primary" disabled={isSaving}>
                                {isSaving ? 'جاري الحفظ...' : 'حفظ'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <style>{`
                .input-style { background-color: #F9FAFB; border: 1px solid #D1D5DB; border-radius: 0.5rem; padding: 0.75rem 1rem; width: 100%; outline: none; color: #111827; }
                .dark .input-style { background-color: #374151; border-color: #4B5563; color: white; }
                .input-style:focus { --tw-ring-color: #005A9C; box-shadow: 0 0 0 2px var(--tw-ring-color); }
                .btn-primary { background-color: #005A9C; color: white; font-weight: 600; padding: 0.5rem 1.5rem; border-radius: 0.5rem; transition: all 0.2s; min-width: 7.5rem; }
                .btn-primary:hover { background-color: #004B80; }
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

export default AddEditRoleModal;