import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { supabase } from '../lib/supabaseClient';
import { Policy } from '../types';
import { CloseIcon, BookOpenIcon, CloudArrowUpIcon, PaperClipIcon } from '../icons/Icons';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { logActivity } from '../lib/activityLogger';

interface AddPolicyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveSuccess: () => void;
    policyToEdit: Policy | null;
}

const AddPolicyModal: React.FC<AddPolicyModalProps> = ({ isOpen, onClose, onSaveSuccess, policyToEdit }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const { addToast } = useToast();
    const { currentUser } = useAuth();
    const isEditMode = !!policyToEdit;

    useEffect(() => {
        if (isOpen) {
            if (policyToEdit) {
                setTitle(policyToEdit.title);
                setDescription(policyToEdit.description || '');
            } else {
                setTitle('');
                setDescription('');
            }
            setFile(null);
        }
    }, [isOpen, policyToEdit]);

    const handleClose = useCallback(() => {
        if (isSaving) return;
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300);
    }, [isSaving, onClose]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.type !== 'application/pdf') {
                addToast('خطأ', 'الرجاء اختيار ملف بصيغة PDF فقط.', 'error');
                return;
            }
            if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
                addToast('خطأ', 'حجم الملف يجب أن يكون أقل من 10 ميجابايت.', 'error');
                return;
            }
            setFile(selectedFile);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        setIsSaving(true);
        try {
            let file_url: string | null = policyToEdit?.file_url || null;
            let file_name: string | null = policyToEdit?.file_name || null;
            let display_file_name: string | null = policyToEdit?.display_file_name || null;

            // If a new file is uploaded (in add or edit mode)
            if (file) {
                // If editing and there was an old file, remove it
                if (isEditMode && policyToEdit?.file_name) {
                    const { error: deleteError } = await supabase.storage.from('policies').remove([policyToEdit.file_name]);
                    if (deleteError) console.error("Could not delete old file:", deleteError.message);
                }

                // Generate a safe, unique filename using UUID
                const fileExt = file.name.split('.').pop();
                const randomName = `${crypto.randomUUID()}.${fileExt}`;
                const filePath = `${currentUser?.user_id || 'user'}/${Date.now()}/${randomName}`;
                
                const { data: uploadData, error: uploadError } = await supabase.storage.from('policies').upload(filePath, file);
                if (uploadError) throw uploadError;

                const { data: urlData } = supabase.storage.from('policies').getPublicUrl(uploadData.path);
                file_url = urlData.publicUrl;
                file_name = filePath; // Store the full path for deletion
                display_file_name = file.name; // Store original filename for display
            }

            const policyData: { [key: string]: any } = {
                title,
                description,
                file_url,
                file_name,
                display_file_name,
            };
            if (isEditMode && policyToEdit) {
                policyData.id = policyToEdit.id;
            }

            const { data, error: upsertError } = await supabase
                .from('policies')
                .upsert(policyData)
                .select()
                .single();

            if (upsertError) throw upsertError;
            if (!data) throw new Error("لم يتم إرجاع بيانات بعد الحفظ.");

            const savedPolicy = data as Policy;
            const action = isEditMode ? 'UPDATE_POLICY' : 'CREATE_POLICY';
            await logActivity(currentUser, action, { policyId: savedPolicy.id, policyTitle: savedPolicy.title });

            addToast(`تم ${isEditMode ? 'تحديث' : 'إضافة'} السياسة بنجاح`, '', 'success');
            onSaveSuccess();
            handleClose();

        } catch (error: any) {
            console.error('Error saving policy:', error);
            addToast('خطأ', `فشل حفظ السياسة: ${error.message}`, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[60] flex justify-center items-center p-4" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-black/60" onClick={handleClose} />
            <div className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg transform ${isClosing ? 'animate-modal-out' : 'animate-modal-in'}`}>
                <div className="p-6">
                    <button onClick={handleClose} className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-lg text-primary dark:text-primary-light">
                            <BookOpenIcon className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-primary dark:text-white">{isEditMode ? 'تعديل سياسة' : 'إضافة سياسة جديدة'}</h2>
                        </div>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">عنوان السياسة</label>
                            <input value={title} onChange={(e) => setTitle(e.target.value)} required className="input-style" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الوصف (اختياري)</label>
                            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="input-style" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ملف السياسة (PDF - اختياري)</label>
                            <div className="mt-2 flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                                <div className="space-y-1 text-center">
                                    <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <div className="flex text-sm text-gray-600 dark:text-gray-400">
                                        <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none">
                                            <span>اختر ملفًا</span>
                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf" />
                                        </label>
                                        <p className="pr-1">أو اسحبه وأفلته هنا</p>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-500">PDF فقط، بحد أقصى 10 ميجابايت</p>
                                </div>
                            </div>
                            {file ? (
                                <div className="mt-2 text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <PaperClipIcon className="w-4 h-4" /> <span>{file.name}</span>
                                </div>
                            ) : isEditMode && policyToEdit?.file_name && (
                                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                    <PaperClipIcon className="w-4 h-4" /> <span>الملف الحالي: {policyToEdit.display_file_name || decodeURIComponent(policyToEdit.file_name.split('/').pop() || '')}</span>
                                </div>
                            )}
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
                .btn-primary { background-color: #005A9C; color: white; font-weight: 600; padding: 0.5rem 1.5rem; border-radius: 0.5rem; transition: all 0.2s; min-width: 6.25rem; }
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

export default AddPolicyModal;