import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Employee, OfficeContact, Task, Transaction, GlobalSearchResults } from '../types';
import { 
    CloseIcon, 
    SearchIcon, 
    UserIcon, 
    PhoneIcon, 
    BellIcon, 
    DocumentDuplicateIcon 
} from '../icons/Icons';

interface GlobalSearchProps {
    isOpen: boolean;
    onClose: () => void;
    employees: Employee[];
    officeContacts: OfficeContact[];
    tasks: Task[];
    transactions: Transaction[];
    onSelectEmployee: (employee: Employee) => void;
    onSelectTask: (task: Task) => void;
    onSelectTransaction: (transaction: Transaction) => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ 
    isOpen, 
    onClose, 
    employees, 
    officeContacts, 
    tasks, 
    transactions, 
    onSelectEmployee,
    onSelectTask,
    onSelectTransaction
}) => {
    const [isClosing, setIsClosing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setSearchTerm('');
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300);
    };

    const results: GlobalSearchResults | null = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();
        if (term.length < 2) return null;

        return {
            employees: employees.filter(e => 
                e.full_name_ar.toLowerCase().includes(term) || 
                e.employee_id.includes(term) ||
                e.full_name_en.toLowerCase().includes(term)
            ).slice(0, 5),
            officeContacts: officeContacts.filter(c => 
                c.name.toLowerCase().includes(term) || 
                c.extension.includes(term)
            ).slice(0, 5),
            tasks: tasks.filter(t => 
                t.title.toLowerCase().includes(term)
            ).slice(0, 5),
            transactions: transactions.filter(t => 
                t.subject.toLowerCase().includes(term) || 
                t.transaction_number.toLowerCase().includes(term)
            ).slice(0, 5),
        };
    }, [searchTerm, employees, officeContacts, tasks, transactions]);
    
    const totalResults = results 
        ? results.employees.length + results.officeContacts.length + results.tasks.length + results.transactions.length
        : 0;

    if (!isOpen) return null;
    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;

    const ResultSection: React.FC<{title: string, icon: React.ReactNode, children: React.ReactNode, count: number}> = ({title, icon, children, count}) => {
        if (count === 0) return null;
        return (
            <div>
                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    {icon} {title}
                </h3>
                <ul className="divide-y divide-gray-100 dark:divide-gray-700">{children}</ul>
            </div>
        );
    };

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-50 flex justify-center items-start pt-16 sm:pt-24" role="dialog" aria-modal="true">
            <div className={`fixed inset-0 bg-black/60 ${isClosing ? 'animate-backdrop-out' : 'animate-backdrop-in'}`} onClick={handleClose} aria-hidden="true" />
            <div className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[70vh] flex flex-col transform ${isClosing ? 'animate-modal-out' : 'animate-modal-in'}`}>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
                     <div className="relative w-full">
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="ابحث في كل شيء..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-transparent border-0 focus:outline-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-500"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                        </div>
                    </div>
                     <button onClick={handleClose} className="p-2 text-gray-500 hover:text-gray-800 dark:hover:text-white">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="overflow-y-auto">
                    {searchTerm.length < 2 && (
                         <div className="text-center py-16 px-4">
                            <p className="text-gray-500 dark:text-gray-400">اكتب حرفين على الأقل للبدء في البحث.</p>
                        </div>
                    )}
                    {searchTerm.length >= 2 && results && totalResults > 0 && (
                        <div>
                            <ResultSection title="الموظفين" icon={<UserIcon className="w-4 h-4"/>} count={results.employees.length}>
                                {results.employees.map(e => (
                                    <li key={`emp-${e.id}`}><button onClick={() => onSelectEmployee(e)} className="w-full text-right p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <p className="font-semibold text-gray-800 dark:text-white">{e.full_name_ar}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{e.job_title} - {e.employee_id}</p>
                                    </button></li>
                                ))}
                            </ResultSection>
                             <ResultSection title="تحويلات المكاتب" icon={<PhoneIcon className="w-4 h-4"/>} count={results.officeContacts.length}>
                                {results.officeContacts.map(c => (
                                    <li key={`contact-${c.id}`}><button className="w-full text-right p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <p className="font-semibold text-gray-800 dark:text-white">{c.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">تحويلة: {c.extension}</p>
                                    </button></li>
                                ))}
                            </ResultSection>
                             <ResultSection title="المهام" icon={<BellIcon className="w-4 h-4"/>} count={results.tasks.length}>
                                {results.tasks.map(t => (
                                    <li key={`task-${t.id}`}><button onClick={() => onSelectTask(t)} className="w-full text-right p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <p className="font-semibold text-gray-800 dark:text-white">{t.title}</p>
                                        <p className={`text-sm ${t.is_completed ? 'text-green-500' : 'text-gray-500 dark:text-gray-400'}`}>{t.is_completed ? 'مكتملة' : 'قيد التنفيذ'}</p>
                                    </button></li>
                                ))}
                            </ResultSection>
                            <ResultSection title="المعاملات" icon={<DocumentDuplicateIcon className="w-4 h-4"/>} count={results.transactions.length}>
                                {results.transactions.map(t => (
                                    <li key={`trans-${t.id}`}><button onClick={() => onSelectTransaction(t)} className="w-full text-right p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <p className="font-semibold text-gray-800 dark:text-white">{t.subject}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{t.transaction_number}</p>
                                    </button></li>
                                ))}
                            </ResultSection>
                        </div>
                    )}
                     {searchTerm.length >= 2 && results && totalResults === 0 && (
                        <div className="text-center py-16 px-4">
                            <p className="text-gray-500 dark:text-gray-400 font-semibold">لا توجد نتائج</p>
                            <p className="text-sm text-gray-400 dark:text-gray-500">حاول استخدام كلمات بحث مختلفة.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        modalRoot
    );
};

export default GlobalSearch;