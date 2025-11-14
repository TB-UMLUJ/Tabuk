import React from 'react';
import { Transaction, TransactionStatus, TransactionPlatform, TransactionType } from '../types';
import { PaperClipIcon, CalendarDaysIcon, UserIcon, BuildingOfficeIcon, ArrowRightIcon, CheckIcon } from '../icons/Icons';
import { useAuth } from '../contexts/AuthContext';

interface TransactionCardProps {
    transaction: Transaction;
    onSelect: () => void;
    onCycleStatus: (transactionId: number) => void;
}

const statusMap: Record<TransactionStatus, { text: string; className: string }> = {
    new: { text: 'جديدة', className: 'bg-brand/10 text-brand-dark dark:bg-brand/20 dark:text-brand-light' },
    inProgress: { text: 'قيد الإجراء', className: 'bg-yellow-100/70 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' },
    followedUp: { text: 'متابعة', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' },
    completed: { text: 'منجزة', className: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' }
};

const platformMap: Record<TransactionPlatform, string> = {
    Bain: 'نظام بين',
    MinisterEmail: 'بريد المدير',
    HospitalEmail: 'بريد الإدارة'
};


const TransactionCard: React.FC<TransactionCardProps> = ({ transaction, onSelect, onCycleStatus }) => {
    const { hasPermission } = useAuth();
    
    const formattedDate = new Date(transaction.date + 'T00:00:00.000Z').toLocaleDateString('ar-SA', { day: '2-digit', month: 'short', year: 'numeric' });
    const statusInfo = statusMap[transaction.status];
    const typeInfo = {
        incoming: { text: 'واردة', className: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' },
        outgoing: { text: 'صادرة', className: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' }
    }[transaction.type];

    let nextStatusText: string = '';
    switch (transaction.status) {
        case 'new':
            nextStatusText = 'قيد الإجراء';
            break;
        case 'inProgress':
            nextStatusText = 'متابعة';
            break;
        case 'followedUp':
            nextStatusText = 'منجزة';
            break;
    }

    const handleCycleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onCycleStatus(transaction.id);
    };

    return (
        <div 
            onClick={onSelect}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg hover:border-primary/50 dark:hover:border-primary-light/50 hover:-translate-y-1 hover:scale-[1.03] transition-all duration-300 flex flex-col justify-between"
        >
            <div className="p-4">
                <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-md text-gray-800 dark:text-white flex-1">
                        {transaction.subject}
                    </h3>
                    <span className={`flex-shrink-0 text-xs font-bold px-2 py-1 rounded-full ${typeInfo.className}`}>
                        {typeInfo.text}
                    </span>
                </div>

                <div className="flex items-center gap-2 mt-2">
                     <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusInfo.className}`}>
                        {statusInfo.text}
                    </span>
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400" title={transaction.transaction_number}>
                        {transaction.transaction_number}
                    </p>
                </div>
                
                {transaction.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                        {transaction.description}
                    </p>
                )}
                
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400 mt-3">
                    <div className="flex items-center gap-1.5 font-medium">
                        <CalendarDaysIcon className="w-4 h-4" />
                        <span>{formattedDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium">
                        <span className="font-bold">منصة:</span>
                        <span>{platformMap[transaction.platform]}</span>
                    </div>
                    {transaction.attachment && (
                        <div className="flex items-center gap-1 text-primary dark:text-primary-light font-bold">
                            <PaperClipIcon className="w-4 h-4" />
                            <span>مرفق</span>
                        </div>
                    )}
                    {transaction.linked_employee && (
                        <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold">
                            <UserIcon className="w-4 h-4" />
                            <span>موظف</span>
                        </div>
                    )}
                    {transaction.linked_office_contact && (
                        <div className="flex items-center gap-1 text-indigo-500 dark:text-indigo-400 font-bold">
                            <BuildingOfficeIcon className="w-4 h-4" />
                            <span>مكتب</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700 rounded-b-xl">
                 <button
                    onClick={handleCycleClick}
                    disabled={transaction.status === 'completed' || !hasPermission('edit_transactions')}
                    className={`btn w-full gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${transaction.status === 'completed' ? 'btn-secondary' : 'btn-muted'}`}
                    aria-label={transaction.status !== 'completed' ? `نقل إلى حالة ${nextStatusText}` : 'مكتملة'}
                >
                    {transaction.status !== 'completed' ? (
                        <>
                            <ArrowRightIcon className="w-4 h-4" />
                            <span>نقل إلى: {nextStatusText}</span>
                        </>
                    ) : (
                        <>
                            <CheckIcon className="w-4 h-4" />
                            <span>مكتملة</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default TransactionCard;