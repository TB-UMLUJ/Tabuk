import React, { useRef, forwardRef, useImperativeHandle, useMemo } from 'react';
import { ArrowUpTrayIcon, UserPlusIcon, ArrowDownTrayIcon, ArrowsUpDownIcon, SearchIcon } from '../icons/Icons';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Employee } from '../types';

interface SearchAndFilterProps {
    onImportClick: () => void;
    onAddEmployeeClick: () => void;
    onExportClick: () => void;
    onSortClick: () => void;
    employees: Employee[];
    activeFilters: { center: string; jobTitle: string };
    onFilterChange: (filters: { center: string; jobTitle: string }) => void;
    searchTerm: string;
    onSearchChange: (term: string) => void;
}

export interface SearchAndFilterRef {
  focusSearchInput: () => void;
}

const SearchAndFilter = forwardRef<SearchAndFilterRef, SearchAndFilterProps>(({
    onImportClick,
    onAddEmployeeClick,
    onExportClick,
    onSortClick,
    employees,
    activeFilters,
    onFilterChange,
    searchTerm,
    onSearchChange
}, ref) => {
    const { hasPermission } = useAuth();
    const { addToast } = useToast();
    const searchInputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
        focusSearchInput: () => {
            searchInputRef.current?.focus();
        },
    }));

    const filterOptions = useMemo(() => {
        const centers = [...new Set(employees.map(e => e.center).filter(Boolean))].sort();
        const jobTitles = [...new Set(employees.map(e => e.job_title).filter(Boolean))].sort();
        return { centers, jobTitles };
    }, [employees]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        onFilterChange({ ...activeFilters, [name]: value });
    };

    return (
        <div className="bg-white p-3 rounded-xl shadow-md mb-6 border border-gray-200 mt-6 dark:bg-gray-800 dark:border-gray-700">
            <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="ابحث بالاسم, الهوية, الجوال, الرقم الوظيفي..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                />
            </div>
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="grid grid-cols-2 gap-4 w-full md:flex-1">
                    <select
                        name="center"
                        value={activeFilters.center}
                        onChange={handleFilterChange}
                        className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                    >
                        <option value="all">جميع المراكز</option>
                        {filterOptions.centers.map(center => <option key={center} value={center}>{center}</option>)}
                    </select>
                     <select
                        name="jobTitle"
                        value={activeFilters.jobTitle}
                        onChange={handleFilterChange}
                        className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                    >
                        <option value="all">جميع المسميات الوظيفية</option>
                        {filterOptions.jobTitles.map(title => <option key={title} value={title}>{title}</option>)}
                    </select>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto flex-shrink-0">
                    {hasPermission('edit_employees') && (
                         <button
                            onClick={onAddEmployeeClick}
                            className="btn btn-primary flex-1 sm:flex-none gap-2"
                            title="إضافة موظف جديد"
                        >
                            <UserPlusIcon className="h-5 w-5" />
                            <span className="hidden sm:inline">إضافة</span>
                        </button>
                    )}
                    <button
                        onClick={onSortClick}
                        className="btn btn-secondary flex-1 sm:flex-none gap-2"
                        title="فرز متقدم"
                    >
                        <ArrowsUpDownIcon className="h-5 w-5" />
                        <span className="hidden sm:inline">فرز</span>
                    </button>
                    {hasPermission('import_export_employees') && (
                       <>
                         <button
                            onClick={onImportClick}
                            className="btn btn-muted flex-1 sm:flex-none gap-2"
                            title="استيراد الموظفين من ملف Excel"
                        >
                            <ArrowUpTrayIcon className="h-5 w-5" />
                            <span className="hidden sm:inline">استيراد</span>
                        </button>
                        <button
                            onClick={onExportClick}
                            className="btn btn-secondary flex-1 sm:flex-none gap-2"
                            title="تصدير النتائج الحالية"
                        >
                            <ArrowDownTrayIcon className="h-5 w-5" />
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