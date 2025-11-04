

import React, { useState } from 'react';
import { OfficeContact } from '../types';
import { PhoneIcon, BuildingOfficeIcon, PencilIcon, EmailIcon, TrashIcon, Bars3Icon, PaperAirplaneIcon } from '../icons/Icons';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

interface OfficeContactCardProps {
    contact: OfficeContact;
    onEdit: () => void;
    onDelete: () => void;
}

const formatTimestamp = (isoString?: string): string | null => {
    if (!isoString) return null;
    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return null;

        const datePart = date.toLocaleDateString('en-CA'); // Gets YYYY-MM-DD format
        const timePart = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

        return `${datePart} | ${timePart}`;
    } catch (e) {
        return null;
    }
};

const OfficeContactCard: React.FC<OfficeContactCardProps> = ({ contact, onEdit, onDelete }) => {
    const { addToast } = useToast();
    const { hasPermission } = useAuth();
    const [isExpanded, setIsExpanded] = useState(false);
    const lastUpdate = formatTimestamp(contact.updated_at || contact.created_at);

    const handleCall = (e: React.MouseEvent) => {
        e.stopPropagation();
        window.location.href = `tel:${contact.extension}`;
    };
    
    const handleEmailAction = (action: 'copy' | 'send') => {
        if (contact.email) {
            if (action === 'copy') {
                navigator.clipboard.writeText(contact.email)
                    .then(() => addToast('تم نسخ البريد', 'تم نسخ البريد الإلكتروني بنجاح.', 'info'))
                    .catch(err => {
                        console.error('Failed to copy email:', err);
                        addToast('خطأ', 'فشل نسخ البريد الإلكتروني', 'error');
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
                addToast('تم النسخ', 'تم نسخ بيانات جهة الاتصال إلى الحافظة.', 'info');
            } catch (err) {
                console.error('Failed to copy: ', err);
                addToast('خطأ', 'فشل نسخ البيانات', 'error');
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
            className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors ${className}`}
            title={title}
        >
            {children}
        </button>
    );

    return (
        <div className="bg-white rounded-xl shadow-md p-4 pb-8 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all relative">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-200 rounded-lg flex-shrink-0 dark:bg-gray-700">
                    <BuildingOfficeIcon className="w-6 h-6 text-brand dark:text-brand-light" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base text-gray-800 truncate dark:text-white">{contact.name}</h3>
                    {contact.location && <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{contact.location}</p>}
                    {isValidEmail && <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1" dir="ltr">{contact.email}</p>}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Desktop Buttons */}
                    <div className="hidden md:flex items-center gap-1">
                        <button onClick={handleShare} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600 transition-all" title="مشاركة"><PaperAirplaneIcon className="w-5 h-5" /></button>
                        {hasPermission('edit_contacts') && <button onClick={handleEdit} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600 transition-all" title="تعديل"><PencilIcon className="w-5 h-5" /></button>}
                        {hasPermission('delete_contacts') && <button onClick={handleDelete} className="p-2 rounded-lg text-gray-500 hover:bg-danger/10 hover:text-danger dark:text-gray-400 dark:hover:bg-danger/20 dark:hover:text-red-400 transition-all" title="حذف"><TrashIcon className="w-5 h-5" /></button>}
                        {isValidEmail && <button onClick={() => handleEmailAction('copy')} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600 transition-all" title={`نسخ ${contact.email}`}><EmailIcon className="w-5 h-5" /></button>}
                        <button
                            onClick={handleCall}
                            className="flex items-center gap-1.5 bg-primary text-white font-semibold py-1.5 px-3 rounded-lg hover:bg-primary-dark transition-all duration-200 transform hover:-translate-y-0.5"
                            title={`اتصال بالرقم ${contact.extension}`}
                        >
                            <PhoneIcon className="w-4 h-4" />
                            <span className="text-sm pt-px">{contact.extension}</span>
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
                <div className="md:hidden mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-5 gap-1 animate-fade-in text-center">
                    <ActionButton onClick={handleCall} title={`اتصال بالرقم ${contact.extension}`} className="text-primary hover:bg-primary/10 dark:text-primary-light dark:hover:bg-primary/20">
                        <PhoneIcon className="w-6 h-6" />
                        <span className="text-xs">{contact.extension}</span>
                    </ActionButton>
                     <ActionButton onClick={handleShare} title="مشاركة" className="text-purple-600 hover:bg-purple-100 dark:text-purple-400 dark:hover:bg-purple-900/50">
                        <PaperAirplaneIcon className="w-6 h-6" />
                        <span className="text-xs">مشاركة</span>
                    </ActionButton>
                    {hasPermission('edit_contacts') && (
                        <ActionButton onClick={handleEdit} title="تعديل">
                            <PencilIcon className="w-6 h-6" />
                        </ActionButton>
                    )}
                    {hasPermission('delete_contacts') && (
                        <ActionButton onClick={handleDelete} title="حذف" className="text-danger hover:bg-danger/10">
                            <TrashIcon className="w-6 h-6" />
                        </ActionButton>
                    )}
                    {isValidEmail && (
                        <ActionButton onClick={(e) => { e.stopPropagation(); handleEmailAction('copy'); }} title="نسخ البريد" className="text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/50">
                            <EmailIcon className="w-6 h-6" />
                            <span className="text-xs">نسخ</span>
                        </ActionButton>
                    )}
                </div>
            )}
            {lastUpdate && (
                <p className="absolute bottom-2 left-4 text-[10px] text-gray-400 dark:text-gray-500" dir="ltr">
                    Last Update: {lastUpdate}
                </p>
            )}
        </div>
    );
};

export default OfficeContactCard;