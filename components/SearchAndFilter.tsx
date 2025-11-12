import React, { useRef, forwardRef, useImperativeHandle, useMemo } from 'react';
import { ArrowUpTrayIcon, UserPlusIcon, ArrowDownTrayIcon, ArrowsUpDownIcon } from '../icons/Icons';
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
}, ref) => {
    const { hasPermission } = useAuth();
    const { addToast } = useToast();

    useImperativeHandle(ref, () => ({
        focusSearchInput: () => {
            // Search input removed
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
                            className="p-2 rounded-lg flex-1 sm:flex-none flex items-center justify-center transition-all duration-200 font-semibold bg-primary text-white hover:bg-primary-dark transform hover:-translate-y-0.5"
                            title="إضافة موظف جديد"
                        >
                            <UserPlusIcon className="h-5 w-5 ml-2" />
                            إضافة
                        </button>
                    )}
                    <button
                        onClick={onSortClick}
                        className="p-2 rounded-lg flex-1 sm:flex-none flex items-center justify-center transition-all duration-200 font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transform hover:-translate-y-0.5"
                        title="فرز متقدم"
                    >
                        <ArrowsUpDownIcon className="h-5 w-5 ml-2" />
                        <span className="hidden sm:inline">فرز</span>
                    </button>
                    {hasPermission('import_export_employees') && (
                       <>
                         <button
                            onClick={onImportClick}
                            className="p-2 rounded-lg flex-1 sm:flex-none flex items-center justify-center transition-all duration-200 font-semibold bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:text-primary-light dark:hover:bg-primary/30 transform hover:-translate-y-0.5"
                            title="استيراد الموظفين من ملف Excel"
                        >
                            <ArrowUpTrayIcon className="h-5 w-5 ml-2" />
                            <span className="hidden sm:inline">استيراد</span>
                        </button>
                        <button
                            onClick={onExportClick}
                            className="p-2 rounded-lg flex-1 sm:flex-none flex items-center justify-center transition-all duration-200 font-semibold bg-brand/10 text-brand-dark hover:bg-brand/20 dark:bg-brand/20 dark:text-brand-light dark:hover:bg-brand/30 transform hover:-translate-y-0.5"
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