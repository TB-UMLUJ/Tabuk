


import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { Transaction, TransactionStatus, TransactionPlatform, Attachment, TransactionType } from '../types';
import { CloseIcon, PencilIcon, TrashIcon, CalendarDaysIcon, DocumentDuplicateIcon, PaperClipIcon, ArrowDownTrayIcon, UserIcon, BuildingOfficeIcon } from '../icons/Icons';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

interface TransactionDetailModalProps {
    isOpen: boolean;
    transaction: Transaction | null;
    onClose: () => void;
    onEdit: (transaction: Transaction) => void;
    onDelete: (transaction: Transaction) => void;
}

const statusMap: Record<TransactionStatus, { text: string; className: string }> = {
    new: { text: 'جديدة', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
    inProgress: { text: 'قيد الإجراء', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
    followedUp: { text: 'متابعة', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' },
    completed: { text: 'منجزة', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' }
};

const platformMap: Record<TransactionPlatform, string> = {
    Bain: 'نظام بين',
    MinisterEmail: 'بريد المدير',
    HospitalEmail: 'بريد الإدارة'
};

const typeMap: Record<TransactionType, string> = {
    incoming: 'معاملة واردة',
    outgoing: 'معاملة صادرة'
};

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({ isOpen, transaction, onClose, onEdit, onDelete }) => {
    const [isClosing, setIsClosing] = useState(false);
    const { hasPermission } = useAuth();
    const { addToast } = useToast();

    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'auto';
        return () => { document.body.style.overflow = 'auto'; };
    }, [isOpen]);

    const handleClose = useCallback(() => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300);
    }, [onClose]);

    const handleAction = (action: () => void, permission: string, permissionName: string) => {
        if (hasPermission(permission)) {
            action();
        } else {
            addToast('غير مصرح', `ليس لديك الصلاحية ل${permissionName}.`, 'error');
        }
    };

    const handleEdit = useCallback(() => {
        if (transaction) {
            onEdit(transaction);
        }
    }, [transaction, onEdit]);
    
    const handleDelete = () => {
        if (transaction) {
            onDelete(transaction);
        }
    };

    const downloadAttachment = useCallback((attachment: Attachment) => {
        const byteCharacters = atob(attachment.data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: attachment.type });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = attachment.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, []);

    const InfoRow: React.FC<{ label: string; value?: string; children?: React.ReactNode }> = ({ label, value, children }) => {
        if (!value && !children) return null;
        return (
            <div className="py-3">
                <p className="text-sm text-gray-500 font-medium dark:text-gray-400">{label}</p>
                {value && <p className="text-base font-semibold text-gray-800 dark:text-white break-words">{value}</p>}
                {children}
            </div>
        );
    };
    
    if (!isOpen) return null;
    const modalRoot = document.getElementById('modal-root');
    if (!transaction || !modalRoot) return null;

    const statusInfo = statusMap[transaction.status];

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-50 flex justify-center items-center p-4" role="dialog" aria-modal="true">
            <div className={`fixed inset-0 bg-black/60 ${isClosing ? 'animate-backdrop-out' : 'animate-backdrop-in'}`} onClick={handleClose} aria-hidden="true" />
            <div className={`relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform ${isClosing ? 'animate-modal-out' : 'animate-modal-in'} dark:bg-gray-800`}>
                 <div className="p-6 md:p-8">
                    <button onClick={handleClose} className="absolute top-4 left-4 text-gray-400 hover:text-gray-800 transition-all duration-300 z-10 p-2 bg-gray-100/50 rounded-full dark:bg-gray-700/50 dark:text-gray-300 dark:hover:text-white hover:bg-gray-200/80 transform hover:rotate-90">
                       <CloseIcon className="w-6 h-6" />
                    </button>

                    <div className="flex items-start gap-4 mb-4">
                        <div className="bg-primary-light p-3 rounded-lg text-primary dark:bg-primary/20 dark:text-primary-light mt-1">
                            <DocumentDuplicateIcon className="w-8 h-8"/>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl md:text-2xl font-bold text-primary dark:text-white">{transaction.subject}</h2>
                             <div className="flex flex-wrap items-center gap-2 mt-2">
                                <span className={`text-sm font-bold px-3 py-1 rounded-full ${statusInfo.className}`}>{statusInfo.text}</span>
                                <span className="text-sm font-semibold text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-3 py-1 rounded-full">{typeMap[transaction.type]}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-2 grid grid-cols-2 gap-x-4 sm:gap-x-6 dark:border-gray-700">
                        <InfoRow label="رقم المعاملة" value={transaction.transaction_number} />
                        <InfoRow label="تاريخ المعاملة" value={new Date(transaction.date + 'T00:00:00.000Z').toLocaleDateString('ar-SA', { calendar: 'gregory', year: 'numeric', month: 'long', day: 'numeric' })}/>
                        <InfoRow label="المنصة" value={platformMap[transaction.platform]}/>
                         <InfoRow label="المرفقات">
                            {transaction.attachment ? (
                                <button onClick={() => downloadAttachment(transaction.attachment!)} className="flex items-center gap-2 text-primary dark:text-primary-light font-bold hover:underline">
                                    <ArrowDownTrayIcon className="w-5 h-5"/>
                                    <span>تحميل: {transaction.attachment.name}</span>
                                </button>
                            ) : <span className="text-base font-semibold text-gray-400 dark:text-gray-500">لا يوجد</span>}
                        </InfoRow>
                        <InfoRow label="مرتبطة بـ">
                            {transaction.linked_employee ? (
                                <div className="flex items-center gap-2">
                                    <UserIcon className="w-5 h-5 text-gray-400"/>
                                    <span className="text-base font-semibold text-gray-800 dark:text-white">
                                        {transaction.linked_employee.full_name_ar}
                                    </span>
                                </div>
                            ) : transaction.linked_office_contact ? (
                                <div className="flex items-center gap-2">
                                    <BuildingOfficeIcon className="w-5 h-5 text-gray-400"/>
                                    <span className="text-base font-semibold text-gray-800 dark:text-white">
                                        {transaction.linked_office_contact.name}
                                    </span>
                                </div>
                            ) : (
                                <span className="text-base font-semibold text-gray-400 dark:text-gray-500">لا يوجد</span>
                            )}
                        </InfoRow>
                        <div className="col-span-2">
                            <InfoRow label="ملاحظات" value={transaction.description} />
                        </div>
                    </div>
                    
                    <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-end gap-2">
                        {hasPermission('edit_transactions') && (
                            <button onClick={handleEdit} className="text-center bg-gray-100 text-gray-700 p-2.5 rounded-lg hover:bg-gray-200 transition-all duration-200 transform hover:scale-105 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600" aria-label="تعديل" title="تعديل">
                                <PencilIcon className="w-5 h-5" />
                            </button>
                        )}
                        {hasPermission('delete_transactions') && (
                            <button onClick={handleDelete} className="text-center bg-danger/10 text-danger p-2.5 rounded-lg hover:bg-danger/20 transition-all duration-200 transform hover:scale-105 dark:bg-danger/20 dark:text-red-400 dark:hover:bg-danger/30" aria-label="حذف" title="حذف">
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                </div>
            </div>
        </div>,
        modalRoot
    );
};

export default TransactionDetailModal;
