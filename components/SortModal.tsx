import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { CloseIcon, ArrowsUpDownIcon } from '../icons/Icons';

export type SortKey = 'full_name_ar' | 'full_name_en' | 'employee_id' | 'updated_at' | 'center' | 'nationality';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
    key: SortKey;
    direction: SortDirection;
}

interface SortModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentSort: SortConfig;
    onApplySort: (sortConfig: SortConfig) => void;
}

const sortOptions: { key: SortKey; label: string }[] = [
    { key: 'full_name_ar', label: 'الاسم بالعربية' },
    { key: 'full_name_en', label: 'الاسم بالإنجليزية' },
    { key: 'employee_id', label: 'الرقم الوظيفي' },
    { key: 'center', label: 'المركز' },
    { key: 'nationality', label: 'الجنسية' },
    { key: 'updated_at', label: 'آخر تحديث' },
];

const directionOptions: { key: SortDirection; label: string }[] = [
    { key: 'asc', label: 'تصاعدي' },
    { key: 'desc', label: 'تنازلي' },
];

const SortModal: React.FC<SortModalProps> = ({ isOpen, onClose, currentSort, onApplySort }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [selectedKey, setSelectedKey] = useState<SortKey>(currentSort.key);
    const [selectedDirection, setSelectedDirection] = useState<SortDirection>(currentSort.direction);

    useEffect(() => {
        if (isOpen) {
            setSelectedKey(currentSort.key);
            setSelectedDirection(currentSort.direction);
        }
    }, [isOpen, currentSort]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300);
    };

    const handleApply = () => {
        onApplySort({ key: selectedKey, direction: selectedDirection });
        handleClose();
    };

    if (!isOpen) return null;
    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-50 flex justify-center items-center p-4" role="dialog" aria-modal="true">
            <div className={`fixed inset-0 bg-black/60 ${isClosing ? 'animate-backdrop-out' : 'animate-backdrop-in'}`} onClick={handleClose} aria-hidden="true" />
            <div className={`relative bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto transform ${isClosing ? 'animate-modal-out' : 'animate-modal-in'} dark:bg-gray-800`}>
                <div className="p-6">
                    <button onClick={handleClose} className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-lg text-primary dark:text-primary-light">
                            <ArrowsUpDownIcon className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">فرز متقدم</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">اختر معايير فرز قائمة الموظفين.</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">الفرز حسب</h3>
                            <div className="space-y-2">
                                {sortOptions.map(option => (
                                    <label key={option.key} className="flex items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 has-[:checked]:bg-primary/10 has-[:checked]:dark:bg-primary/20 has-[:checked]:ring-2 has-[:checked]:ring-primary transition-all cursor-pointer">
                                        <input
                                            type="radio"
                                            name="sort-key"
                                            value={option.key}
                                            checked={selectedKey === option.key}
                                            onChange={() => setSelectedKey(option.key)}
                                            className="w-4 h-4 text-primary bg-gray-100 border-gray-300 focus:ring-primary dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                        />
                                        <span className="mr-3 text-sm font-medium text-gray-900 dark:text-gray-300">{option.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">الترتيب</h3>
                            <div className="flex gap-4">
                                {directionOptions.map(option => (
                                     <label key={option.key} className="flex-1 flex items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 has-[:checked]:bg-primary/10 has-[:checked]:dark:bg-primary/20 has-[:checked]:ring-2 has-[:checked]:ring-primary transition-all cursor-pointer">
                                        <input
                                            type="radio"
                                            name="sort-direction"
                                            value={option.key}
                                            checked={selectedDirection === option.key}
                                            onChange={() => setSelectedDirection(option.key)}
                                            className="w-4 h-4 text-primary bg-gray-100 border-gray-300 focus:ring-primary dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                        />
                                        <span className="mr-3 text-sm font-medium text-gray-900 dark:text-gray-300">{option.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700 pt-5">
                        <button type="button" onClick={handleClose} className="btn btn-secondary">
                            إلغاء
                        </button>
                        <button type="button" onClick={handleApply} className="btn btn-primary">
                            تطبيق
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        modalRoot
    );
};

export default SortModal;
