

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { OfficeContact } from '../types';
import { CloseIcon, PhoneIcon, PencilIcon } from '../icons/Icons';

interface AddOfficeContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (contact: Omit<OfficeContact, 'id'> & { id?: number }) => void;
    contactToEdit: OfficeContact | null;
}

const initialContactState: Omit<OfficeContact, 'id'> = {
    name: '',
    extension: '',
    location: '',
    email: '',
};

const AddOfficeContactModal: React.FC<AddOfficeContactModalProps> = ({ isOpen, onClose, onSave, contactToEdit }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [contactData, setContactData] = useState(initialContactState);
    const [emailError, setEmailError] = useState('');

    const isEditMode = !!contactToEdit;

    const validateEmail = (email: string): string => {
        if (!email) return ''; // Optional field
        const emailRegex = /^[^\s@]+@moh\.gov\.sa$/i;
        if (!emailRegex.test(email.toLowerCase())) {
            return 'يجب أن يكون البريد الإلكتروني صالحًا وينتهي بـ @moh.gov.sa';
        }
        return '';
    };
    
    useEffect(() => {
        if (contactToEdit) {
            setContactData({
                name: contactToEdit.name,
                extension: contactToEdit.extension,
                location: contactToEdit.location || '',
                email: contactToEdit.email || '',
            });
            setEmailError(validateEmail(contactToEdit.email || ''));
        } else {
            setContactData(initialContactState);
            setEmailError('');
        }
    }, [contactToEdit]);

    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'auto';
        return () => { document.body.style.overflow = 'auto'; };
    }, [isOpen]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'email') {
            setEmailError(validateEmail(value));
        }
        setContactData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const currentEmailError = validateEmail(contactData.email || '');
        if (currentEmailError) {
            setEmailError(currentEmailError);
            return;
        }
        const dataToSave: Omit<OfficeContact, 'id'> & { id?: number } = {
            ...contactData,
            id: contactToEdit?.id,
            location: contactData.location || undefined,
            email: contactData.email || undefined
        };
        onSave(dataToSave);
    };

    if (!isOpen) return null;
    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-50 flex justify-center items-center p-4" role="dialog" aria-modal="true">
            <div
                className={`fixed inset-0 bg-black/60 ${isClosing ? 'animate-backdrop-out' : 'animate-backdrop-in'}`}
                onClick={handleClose}
                aria-hidden="true"
            />
            <div className={`relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto transform ${isClosing ? 'animate-modal-out' : 'animate-modal-in'} dark:bg-gray-800`}>
                <div className="p-6 md:p-8">
                    <button onClick={handleClose} className="absolute top-4 left-4 text-gray-400 hover:text-gray-800 transition-all duration-300 z-10 p-2 bg-gray-100/50 rounded-full dark:bg-gray-700/50 dark:text-gray-300 dark:hover:text-white hover:bg-gray-200/80 transform hover:rotate-90">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                    
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-primary-light p-3 rounded-lg text-primary dark:bg-primary/20 dark:text-primary-light">
                            {isEditMode ? <PencilIcon className="w-8 h-8" /> : <PhoneIcon className="w-8 h-8"/>}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-primary dark:text-white">
                                {isEditMode ? 'تعديل بيانات المكتب' : 'إضافة تحويلة جديدة'}
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400">
                                {isEditMode ? 'قم بتحديث البيانات المطلوبة.' : 'املأ الحقول لإضافة تحويلة مكتب جديدة.'}
                            </p>
                        </div>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                اسم المكتب<span className="text-danger mr-1">*</span>
                            </label>
                            <input id="name" name="name" type="text" required value={contactData.name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                        </div>
                        <div>
                            <label htmlFor="extension" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                رقم التحويلة<span className="text-danger mr-1">*</span>
                            </label>
                            <input id="extension" name="extension" type="text" required value={contactData.extension} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                        </div>
                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الموقع (اختياري)</label>
                            <input id="location" name="location" type="text" value={contactData.location || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                        </div>
                         <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">البريد الإلكتروني (اختياري)</label>
                            <input id="email" name="email" type="email" value={contactData.email || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                            {emailError && <p className="text-danger text-xs mt-1">{emailError}</p>}
                        </div>
                        
                        <div className="mt-8 flex justify-end gap-3">
                            <button type="button" onClick={handleClose} className="btn btn-secondary">
                                إلغاء
                            </button>
                            <button 
                                type="submit" 
                                disabled={!!emailError}
                                className="btn btn-primary"
                            >
                                {isEditMode ? 'حفظ' : 'إضافة'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>,
        modalRoot
    );
};

export default AddOfficeContactModal;
