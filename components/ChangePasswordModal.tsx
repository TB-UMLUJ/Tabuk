import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { CloseIcon, KeyIcon, EyeIcon, EyeSlashIcon } from '../icons/Icons';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const { currentUser, changePassword } = useAuth();
    const { addToast } = useToast();

    useEffect(() => {
        if (isOpen) {
            // Reset state when modal opens
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
            setError('');
            setShowCurrent(false);
            setShowNew(false);
            setShowConfirm(false);
            setIsSaving(false);
        }
    }, [isOpen]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            setError('الرجاء تعبئة جميع الحقول.');
            return;
        }

        if (newPassword !== confirmNewPassword) {
            setError('كلمة المرور الجديدة وتأكيدها غير متطابقين.');
            return;
        }

        if (newPassword.length < 6) {
            setError('يجب أن تتكون كلمة المرور الجديدة من 6 أحرف على الأقل.');
            return;
        }

        if (!currentUser) {
            setError('المستخدم غير مسجل دخوله.');
            return;
        }

        setIsSaving(true);
        const success = await changePassword(currentUser.user_id, currentPassword, newPassword);
        setIsSaving(false);

        if (success) {
            addToast('تم تغيير كلمة المرور بنجاح', '', 'success');
            handleClose();
        } else {
            setError('كلمة المرور الحالية غير صحيحة.');
        }
    };

    if (!isOpen) return null;
    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[55] flex justify-center items-center p-4" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-black/60" onClick={handleClose} />
            <div className={`relative bg-white rounded-2xl shadow-xl w-full max-w-md m-4 transform ${isClosing ? 'animate-modal-out-scale' : 'animate-modal-in-scale'} dark:bg-gray-800`}>
                <div className="p-6 md:p-8">
                    <button onClick={handleClose} className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-primary-light p-3 rounded-lg text-primary dark:bg-primary/20 dark:text-white">
                            <KeyIcon className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-primary dark:text-white">تغيير كلمة المرور</h2>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">كلمة المرور الحالية</label>
                            <div className="relative">
                                <input type={showCurrent ? 'text' : 'password'} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className="w-full input-style pr-10" />
                                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute inset-y-0 left-0 px-3 flex items-center text-gray-500">
                                    {showCurrent ? <EyeSlashIcon className="w-5 h-5"/> : <EyeIcon className="w-5 h-5"/>}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">كلمة المرور الجديدة</label>
                            <div className="relative">
                                <input type={showNew ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="w-full input-style pr-10" />
                                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute inset-y-0 left-0 px-3 flex items-center text-gray-500">
                                    {showNew ? <EyeSlashIcon className="w-5 h-5"/> : <EyeIcon className="w-5 h-5"/>}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">تأكيد كلمة المرور الجديدة</label>
                             <div className="relative">
                                <input type={showConfirm ? 'text' : 'password'} value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} required className="w-full input-style pr-10" />
                                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute inset-y-0 left-0 px-3 flex items-center text-gray-500">
                                    {showConfirm ? <EyeSlashIcon className="w-5 h-5"/> : <EyeIcon className="w-5 h-5"/>}
                                </button>
                            </div>
                        </div>
                        
                        {error && <p className="text-sm text-danger text-center">{error}</p>}

                        <div className="mt-8 flex justify-end gap-3 pt-4">
                            <button type="button" onClick={handleClose} className="btn btn-secondary">إلغاء</button>
                            <button type="submit" className="btn btn-primary" disabled={isSaving}>
                                {isSaving ? 'جاري الحفظ...' : 'حفظ'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <style>{`
                .input-style { background-color: #F9FAFB; border: 1px solid #D1D5DB; border-radius: 0.5rem; padding: 0.75rem 1rem; width: 100%; outline: none; color: #111827; }
                .input-style:focus { --tw-ring-color: #008755; box-shadow: 0 0 0 2px var(--tw-ring-color); }
                .dark .input-style { background-color: #374151; border-color: #4B5563; color: white; }
            `}</style>
        </div>,
        modalRoot
    );
};

export default ChangePasswordModal;
