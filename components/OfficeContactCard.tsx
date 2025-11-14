import React, { useState } from 'react';
import { OfficeContact } from '../types';
import { 
    PhoneIcon, 
    BuildingOfficeIcon, 
    PencilIcon, 
    EmailIcon, 
    TrashIcon, 
    Bars3Icon, 
    ShareIcon
} from '../icons/Icons';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

interface OfficeContactCardProps {
    contact: OfficeContact;
    onEdit: () => void;
    onDelete: () => void;
}

const OfficeContactCard: React.FC<OfficeContactCardProps> = ({ contact, onEdit, onDelete }) => {
    const { addToast } = useToast();
    const { hasPermission } = useAuth();
    const [isExpanded, setIsExpanded] = useState(false);

    const handleCall = (e: React.MouseEvent) => {
        e.stopPropagation();
        window.location.href = `tel:${contact.extension}`;
    };
    
    const handleEmailAction = (action: 'copy' | 'send') => {
        if (contact.email) {
            if (action === 'copy') {
                navigator.clipboard.writeText(contact.email)
                    .then(() => addToast('تم نسخ البريد الإلكتروني', '', 'info'))
                    .catch(err => {
                        console.error('Failed to copy email:', err);
                        addToast('خطأ', `فشل نسخ البريد الإلكتروني: ${err.message}`, 'error');
                    });
            } else {
                window.location.href = `mailto:${contact.email}`;
            }
        }
    };

    const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const shareTextParts = [
            `جهة اتصال: ${contact.name}`,
            `التحويلة: ${contact.extension}`
        ];
        if (contact.location) {
            shareTextParts.push(`الموقع: ${contact.location}`);
        }
        if (contact.email && contact.email.includes('@')) {
            shareTextParts.push(`البريد الإلكتروني: ${contact.email}`);
        }
        const shareText = shareTextParts.join('\n');

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `بيانات جهة الاتصال: ${contact.name}`,
                    text: shareText,
                });
            } catch (error) {
                console.log('Share was cancelled or failed', error);
            }
        } else {
            try {
                await navigator.clipboard.writeText(shareText);
                addToast('تم نسخ بيانات جهة الاتصال', '', 'info');
            } catch (err: any) {
                console.error('Failed to copy: ', err);
                addToast('خطأ', `فشل نسخ البيانات: ${err.message}`, 'error');
            }
        }
    };
    
    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit();
    };
    
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete();
    };

    const isValidEmail = contact.email && contact.email.includes('@');
    
    const ActionButton: React.FC<{onClick: (e: React.MouseEvent) => void; title: string; children: React.ReactNode; className?: string}> = 
        ({onClick, title, children, className}) => (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors ${className}`}
            title={title}
        >
            {children}
        </button>
    );

    return (
        <div className="bg-white rounded-xl shadow-md p-3 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:scale-[1.03] relative">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-gray-200 rounded-lg flex-shrink-0 dark:bg-gray-700">
                    <BuildingOfficeIcon className="w-5 h-5 text-accent dark:text-accent-dark" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base text-gray-800 truncate dark:text-white">{contact.name}</h3>
                    {contact.location && <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{contact.location}</p>}
                    {isValidEmail && <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1" dir="ltr">{contact.email}</p>}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Desktop Buttons */}
                    <div className="hidden md:flex items-center gap-1">
                        <button onClick={handleShare} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 transition-all" title="مشاركة"><ShareIcon className="w-5 h-5" /></button>
                        {hasPermission('edit_contacts') && <button onClick={handleEdit} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 transition-all" title="تعديل"><PencilIcon className="w-5 h-5" /></button>}
                        {hasPermission('delete_contacts') && <button onClick={handleDelete} className="p-2 rounded-lg text-gray-500 hover:text-danger hover:bg-danger/10 dark:text-gray-200 dark:hover:text-red-400 dark:hover:bg-danger/20 transition-all" title="حذف"><TrashIcon className="w-5 h-5" /></button>}
                        {isValidEmail && <button onClick={() => handleEmailAction('copy')} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 transition-all" title={`نسخ ${contact.email}`}><EmailIcon className="w-5 h-5" /></button>}
                        <button
                            onClick={handleCall}
                            className="flex items-center gap-1.5 bg-primary text-white font-semibold py-1.5 px-3 rounded-lg hover:bg-primary-dark transition-all duration-200 transform hover:-translate-y-0.5"
                            title={`اتصال بالرقم ${contact.extension}`}
                        >
                            <PhoneIcon className="w-4 h-4" />
                        </button>
                    </div>
                    
                    {/* Mobile More Button */}
                    <div className="md:hidden">
                        <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600">
                            <Bars3Icon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Expanded Menu for Mobile */}
            {isExpanded && (
                <div className="md:hidden mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-5 gap-1 text-center">
                    <ActionButton onClick={handleCall} title={`اتصال بالرقم ${contact.extension}`} className="text-primary dark:text-primary-light hover:bg-primary/10 dark:hover:bg-primary/20">
                        <PhoneIcon className="w-6 h-6" />
                    </ActionButton>
                     <ActionButton onClick={handleShare} title="مشاركة" className="text-accent dark:text-accent-dark hover:bg-accent/10 dark:hover:bg-accent/20">
                        <ShareIcon className="w-6 h-6" />
                    </ActionButton>
                    {hasPermission('edit_contacts') && (
                        <ActionButton onClick={handleEdit} title="تعديل">
                            <PencilIcon className="w-6 h-6" />
                        </ActionButton>
                    )}
                    {hasPermission('delete_contacts') && (
                        <ActionButton onClick={handleDelete} title="حذف" className="text-danger dark:text-red-400 hover:bg-danger/10 dark:hover:bg-danger/20">
                            <TrashIcon className="w-6 h-6" />
                        </ActionButton>
                    )}
                    {isValidEmail && (
                        <ActionButton onClick={(e) => { e.stopPropagation(); handleEmailAction('copy'); }} title="نسخ البريد" className="text-primary dark:text-primary-light hover:bg-primary/10 dark:hover:bg-primary/20">
                            <EmailIcon className="w-6 h-6" />
                        </ActionButton>
                    )}
                </div>
            )}
        </div>
    );
};

export default OfficeContactCard;