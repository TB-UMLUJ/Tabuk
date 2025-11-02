

import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { Transaction, Attachment, TransactionType, TransactionPlatform, TransactionStatus, Employee, OfficeContact } from '../types';
import { CloseIcon, DocumentDuplicateIcon } from '../icons/Icons';
import { useToast } from '../contexts/ToastContext';

interface AddTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (transaction: Omit<Transaction, 'id'> & { id?: number }) => void;
    transactionToEdit: Transaction | null;
    employees: Employee[];
    officeContacts: OfficeContact[];
}

const initialTransactionState: Omit<Transaction, 'id' | 'linked_employee' | 'linked_office_contact'> = {
    transaction_number: '',
    subject: '',
    type: 'incoming',
    platform: 'Bain',
    status: 'new',
    date: new Date().toISOString().split('T')[0], // Default to today
    description: '',
    attachment: undefined,
    linked_employee_id: null,
    linked_office_contact_id: null,
};

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose, onSave, transactionToEdit, employees, officeContacts }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [transactionData, setTransactionData] = useState(initialTransactionState);
    const [linkType, setLinkType] = useState<'none' | 'employee' | 'office'>('none');
    const [employeeSearch, setEmployeeSearch] = useState('');
    const [officeSearch, setOfficeSearch] = useState('');
    const { addToast } = useToast();

    const filteredEmployees = useMemo(() => 
        employees.filter(e => e.full_name_ar.toLowerCase().includes(employeeSearch.toLowerCase())),
    [employees, employeeSearch]);

    const filteredOfficeContacts = useMemo(() =>
        officeContacts.filter(c => c.name.toLowerCase().includes(officeSearch.toLowerCase())),
    [officeContacts, officeSearch]);


    useEffect(() => {
        if (transactionToEdit) {
            setTransactionData({ ...initialTransactionState, ...transactionToEdit });
            if (transactionToEdit.linked_employee_id) {
                setLinkType('employee');
            } else if (transactionToEdit.linked_office_contact_id) {
                setLinkType('office');
            } else {
                setLinkType('none');
            }
        } else {
            setTransactionData(initialTransactionState);
            setLinkType('none');
        }
        setEmployeeSearch('');
        setOfficeSearch('');
    }, [transactionToEdit]);

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'linked_employee_id' || name === 'linked_office_contact_id') {
            const parsedId = parseInt(value, 10);
            setTransactionData(prev => ({ ...prev, [name]: isNaN(parsedId) ? null : parsedId }));
        } else {
            setTransactionData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleLinkTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newType = e.target.value as 'none' | 'employee' | 'office';
        setLinkType(newType);
        setTransactionData(prev => ({
            ...prev,
            linked_employee_id: null,
            linked_office_contact_id: null,
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                addToast("ملف كبير", "حجم الملف كبير جداً. الحجم الأقصى هو 5 ميجابايت.", 'error');
                e.target.value = ''; // Reset file input
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                const newAttachment: Attachment = {
                    name: file.name,
                    type: file.type,
                    data: base64String.split(',')[1], // Remove the "data:..." part
                };
                setTransactionData(prev => ({ ...prev, attachment: newAttachment }));
            };
            reader.readAsDataURL(file);
        }
    };
    
    const removeAttachment = () => {
        const fileInput = document.getElementById('attachment-file') as HTMLInputElement;
        if(fileInput) {
            fileInput.value = '';
        }
        setTransactionData(prev => ({...prev, attachment: undefined}));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave: Omit<Transaction, 'id'> & { id?: number } = {
            ...transactionData,
            id: transactionToEdit?.id,
            linked_employee_id: linkType === 'employee' ? transactionData.linked_employee_id : null,
            linked_office_contact_id: linkType === 'office' ? transactionData.linked_office_contact_id : null,
        };
        onSave(dataToSave);
    };

    if (!isOpen) return null;
    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;

    const isEditMode = !!transactionToEdit;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-50 flex justify-center items-center p-4" role="dialog" aria-modal="true">
            <div
                className={`fixed inset-0 bg-black ${isClosing ? 'animate-backdrop-out' : 'animate-backdrop-in'}`}
                onClick={handleClose}
                aria-hidden="true"
            />
            <div className={`relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform ${isClosing ? 'animate-modal-out' : 'animate-modal-in'} dark:bg-gray-800`}>
                <div className="p-6 md:p-8">
                    <button onClick={handleClose} className="absolute top-4 left-4 text-gray-400 hover:text-gray-800 transition-all duration-300 z-10 p-2 bg-gray-100/50 rounded-full dark:bg-gray-700/50 dark:text-gray-300 dark:hover:text-white hover:bg-gray-200/80 transform hover:rotate-90">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                    
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-primary-light p-3 rounded-lg text-primary dark:bg-primary/20 dark:text-primary-light">
                            <DocumentDuplicateIcon className="w-8 h-8"/>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-primary dark:text-white">{isEditMode ? 'تعديل معاملة' : 'إضافة معاملة جديدة'}</h2>
                            <p className="text-gray-500 dark:text-gray-400">املأ الحقول المطلوبة لتسجيل المعاملة.</p>
                        </div>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="transaction_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">رقم المعاملة<span className="text-danger mr-1">*</span></label>
                                <input id="transaction_number" name="transaction_number" type="text" required value={transactionData.transaction_number} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                            </div>
                             <div>
                                <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">التاريخ<span className="text-danger mr-1">*</span></label>
                                <input id="date" name="date" type="date" required value={transactionData.date} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                            </div>
                        </div>
                         <div>
                            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الموضوع<span className="text-danger mr-1">*</span></label>
                            <input id="subject" name="subject" type="text" required value={transactionData.subject} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <div>
                                <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نوع المعاملة</label>
                                <select id="type" name="type" value={transactionData.type} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                    <option value="incoming">واردة</option>
                                    <option value="outgoing">صادرة</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="platform" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المنصة</label>
                                <select id="platform" name="platform" value={transactionData.platform} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                    <option value="Bain">نظام بين</option>
                                    <option value="MinisterEmail">بريد المدير</option>
                                    <option value="HospitalEmail">بريد الإدارة</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الحالة</label>
                                <select id="status" name="status" value={transactionData.status} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                    <option value="new">جديدة</option>
                                    <option value="inProgress">قيد الإجراء</option>
                                    <option value="followedUp">متابعة</option>
                                    <option value="completed">منجزة</option>
                                </select>
                            </div>
                        </div>

                         <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ربط المعاملة بـ (اختياري)</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <select value={linkType} onChange={handleLinkTypeChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                    <option value="none">لا يوجد</option>
                                    <option value="employee">موظف</option>
                                    <option value="office">مكتب</option>
                                </select>
                                
                                {linkType === 'employee' && (
                                    <div className="space-y-2">
                                        <input type="text" placeholder="ابحث عن موظف..." value={employeeSearch} onChange={(e) => setEmployeeSearch(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                        <select name="linked_employee_id" value={transactionData.linked_employee_id || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                            <option value="">-- اختر موظف --</option>
                                            {filteredEmployees.map(emp => (
                                                <option key={emp.id} value={emp.id}>{emp.full_name_ar}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                {linkType === 'office' && (
                                     <div className="space-y-2">
                                        <input type="text" placeholder="ابحث عن مكتب..." value={officeSearch} onChange={(e) => setOfficeSearch(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                        <select name="linked_office_contact_id" value={transactionData.linked_office_contact_id || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                            <option value="">-- اختر مكتب --</option>
                                            {filteredOfficeContacts.map(contact => (
                                                <option key={contact.id} value={contact.id}>{contact.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ملاحظات (اختياري)</label>
                            <textarea id="description" name="description" rows={3} value={transactionData.description} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المرفقات (اختياري)</label>
                            {transactionData.attachment ? (
                                <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-2.5 rounded-lg">
                                    <p className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1" dir="ltr">{transactionData.attachment.name}</p>
                                    <button type="button" onClick={removeAttachment} className="text-danger font-bold text-sm hover:underline mr-3 flex-shrink-0">إزالة</button>
                                </div>
                            ) : (
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                    <label htmlFor="attachment-file" className="cursor-pointer bg-primary/10 text-primary font-semibold py-2 px-4 rounded-lg hover:bg-primary/20 transition-all duration-200 dark:bg-primary/20 dark:text-primary-light dark:hover:bg-primary/30 whitespace-nowrap">
                                        اختر ملف
                                    </label>
                                    <input type="file" id="attachment-file" onChange={handleFileChange} accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" className="hidden" />
                                    <span className="text-sm text-gray-500 dark:text-gray-400">لم يتم اختيار ملف</span>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 flex justify-end gap-3">
                            <button type="button" onClick={handleClose} className="bg-gray-200 text-gray-800 font-semibold py-2 px-6 rounded-lg hover:bg-gray-300 transition-all duration-200 transform hover:-translate-y-0.5 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
                                إلغاء
                            </button>
                            <button type="submit" className="bg-primary text-white font-semibold py-2 px-6 rounded-lg hover:bg-primary-dark transition-all duration-200 transform hover:-translate-y-0.5">
                                {isEditMode ? 'حفظ التغييرات' : 'إضافة المعاملة'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>,
        modalRoot
    );
};

export default AddTransactionModal;