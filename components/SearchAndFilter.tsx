



import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { SearchIcon, ArrowUpTrayIcon, UserPlusIcon, ArrowDownTrayIcon, ArrowsUpDownIcon } from '../icons/Icons';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

interface SearchAndFilterProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    onImportClick: () => void;
    onAddEmployeeClick: () => void;
    onExportClick: () => void;
}

export interface SearchAndFilterRef {
  focusSearchInput: () => void;
}

const SearchAndFilter = forwardRef<SearchAndFilterRef, SearchAndFilterProps>(({
    searchTerm,
    setSearchTerm,
    onImportClick,
    onAddEmployeeClick,
    onExportClick,
}, ref) => {
    const searchInputRef = useRef<HTMLInputElement>(null);
    const { hasPermission } = useAuth();
    const { addToast } = useToast();

    useImperativeHandle(ref, () => ({
        focusSearchInput: () => {
            searchInputRef.current?.focus();
        },
    }));

    const handleAction = (action: () => void, permission: string, permissionName: string) => {
        if (hasPermission(permission)) {
            action();
        } else {
            addToast('غير مصرح', `ليس لديك الصلاحية ل${permissionName}.`, 'error');
        }
    };
    
    return (
        <div className="bg-white p-4 rounded-xl shadow-md mb-6 border border-gray-200 mt-6 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full flex-grow">
                    <input
                        id="main-search-input"
                        ref={searchInputRef}
                        type="text"
                        placeholder="ابحث بالاسم، الرقم الوظيفي، السجل..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    />
                    <label htmlFor="main-search-input" title="بحث" className="absolute inset-y-0 left-0 pl-3 flex items-center cursor-text">
                         <SearchIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    </label>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    {hasPermission('edit_employees') && (
                         <button
                            onClick={onAddEmployeeClick}
                            className="p-2.5 rounded-lg flex-1 sm:flex-none flex items-center justify-center transition-all duration-200 font-semibold bg-primary text-white hover:bg-primary-dark transform hover:-translate-y-0.5"
                            title="إضافة موظف جديد"
                        >
                            <UserPlusIcon className="h-5 w-5 ml-2" />
                            إضافة
                        </button>
                    )}
                    {hasPermission('import_export_employees') && (
                       <>
                         <button
                            onClick={onImportClick}
                            className="p-2.5 rounded-lg flex-1 sm:flex-none flex items-center justify-center transition-all duration-200 font-semibold bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:text-primary-light dark:hover:bg-primary/30 transform hover:-translate-y-0.5"
                            title="استيراد الموظفين من ملف Excel"
                        >
                            <ArrowUpTrayIcon className="h-5 w-5 ml-2" />
                            <span className="hidden sm:inline">استيراد</span>
                        </button>
                        <button
                            onClick={onExportClick}
                            className="p-2.5 rounded-lg flex-1 sm:flex-none flex items-center justify-center transition-all duration-200 font-semibold bg-brand/10 text-brand-dark hover:bg-brand/20 dark:bg-brand/20 dark:text-brand-light dark:hover:bg-brand/30 transform hover:-translate-y-0.5"
                            title="تصدير النتائج الحالية"
                        >
                            <ArrowDownTrayIcon className="h-5 w-5 ml-2" />
                            <span className="hidden sm:inline">تصدير</span>
                        </button>
                       </>
                    )}
                </div>
            </div>
        </div>
    );
});

export default SearchAndFilter;