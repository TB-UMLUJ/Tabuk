import React, { useState, useMemo, useRef } from 'react';
import { OfficeContact } from '../types';
import OfficeContactCard from './OfficeContactCard';
import { SearchIcon, ArrowUpTrayIcon, ArrowDownTrayIcon, PlusIcon } from '../icons/Icons';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

interface OfficeDirectoryProps {
    contacts: OfficeContact[];
    onEditContact: (contact: OfficeContact) => void;
    onAddContact: () => void;
    onDeleteContact: (contact: OfficeContact) => void;
    onImportClick: () => void;
    onExportClick: () => void;
}

const OfficeDirectory: React.FC<OfficeDirectoryProps> = ({ contacts, onEditContact, onAddContact, onDeleteContact, onImportClick, onExportClick }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const { hasPermission } = useAuth();
    const { addToast } = useToast();

    const processedContacts = useMemo(() => {
        return contacts.filter(contact =>
            !searchTerm ||
            contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.extension.includes(searchTerm)
        );
    }, [contacts, searchTerm]);

    const handleAction = (action: () => void, permission: string, permissionName: string) => {
        if (hasPermission(permission)) {
            action();
        } else {
            addToast('غير مصرح', `ليس لديك الصلاحية ل${permissionName}.`, 'error');
        }
    };

    const emptyMessage = searchTerm
        ? "لا توجد نتائج مطابقة لبحثك."
        : "لا توجد تحويلات مكاتب حالياً. يمكنك إضافة تحويلة جديدة أو استيراد قائمة.";

    return (
        <div className="mt-6 animate-fade-in relative pb-24">
            <div className="bg-white p-4 rounded-xl shadow-md mb-6 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full flex-grow">
                        <input
                            type="text"
                            placeholder="ابحث باسم المكتب أو التحويلة..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        {hasPermission('edit_contacts') && (
                            <button 
                                onClick={onAddContact} 
                                className="btn btn-primary flex-1 sm:flex-none gap-2"
                                title="إضافة تحويلة جديدة"
                            >
                                <PlusIcon className="h-5 w-5" /> <span className="hidden sm:inline">إضافة</span>
                            </button>
                        )}
                        {hasPermission('import_export_contacts') && (
                           <>
                            <button onClick={onImportClick} className="btn btn-muted flex-1 sm:flex-none gap-2">
                                <ArrowUpTrayIcon className="h-5 w-5" /> <span className="hidden sm:inline">استيراد</span>
                            </button>
                            <button onClick={onExportClick} className="btn btn-secondary flex-1 sm:flex-none gap-2">
                                <ArrowDownTrayIcon className="h-5 w-5" /> <span className="hidden sm:inline">تصدير</span>
                            </button>
                           </>
                        )}
                    </div>
                </div>
            </div>

            {processedContacts.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {processedContacts.map(contact => (
                        <OfficeContactCard 
                            key={contact.id} 
                            contact={contact} 
                            onEdit={() => handleAction(() => onEditContact(contact), 'edit_contacts', 'تعديل التحويلات')}
                            onDelete={() => handleAction(() => onDeleteContact(contact), 'delete_contacts', 'حذف التحويلات')}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 px-4 bg-gray-50 rounded-lg dark:bg-gray-800">
                    <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
                </div>
            )}
            
        </div>
    );
};

export default OfficeDirectory;