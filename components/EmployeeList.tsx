
import React, { useRef, useCallback } from 'react';
import { Employee } from '../types';
import EmployeeCard from './EmployeeCard';

interface EmployeeListProps {
    employees: Employee[];
    onSelectEmployee: (employee: Employee) => void;
    onLoadMore: () => void;
    hasMore: boolean;
    isLoadingMore: boolean;
}

const EmployeeList: React.FC<EmployeeListProps> = ({ employees, onSelectEmployee, onLoadMore, hasMore, isLoadingMore }) => {
    const observer = useRef<IntersectionObserver | null>(null);

    const lastElementRef = useCallback((node: HTMLDivElement | null) => {
        if (isLoadingMore) return;
        if (observer.current) observer.current.disconnect();
        
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                onLoadMore();
            }
        });

        if (node) observer.current.observe(node);
    }, [isLoadingMore, hasMore, onLoadMore]);

    if (employees.length === 0 && !isLoadingMore) {
        return <p className="text-center text-gray-500 mt-8">لا توجد نتائج مطابقة لبحثك.</p>;
    }

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {employees.map(employee => (
                    <EmployeeCard
                        key={employee.id}
                        employee={employee}
                        onSelect={() => onSelectEmployee(employee)}
                    />
                ))}
            </div>
            
            <div ref={lastElementRef} />

            {isLoadingMore && (
                <div className="flex justify-center items-center py-8">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-primary dark:border-gray-700 dark:border-t-primary"></div>
                    <p className="mr-4 text-lg font-semibold text-gray-600 dark:text-gray-400">جاري التحميل...</p>
                </div>
            )}
        </>
    );
};

export default EmployeeList;