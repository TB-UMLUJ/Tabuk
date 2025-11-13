import React from 'react';
import { Transaction, TransactionStatus, TransactionPlatform } from '../types';
import { PaperClipIcon, CalendarDaysIcon, UserIcon, BuildingOfficeIcon, ArrowRightIcon } from '../icons/Icons';
import { useAuth } from '../contexts/AuthContext';

interface TransactionCardProps {
    transaction: Transaction;
    onSelect: () => void;
    onCycleStatus: (transactionId: number) => void;
}

const statusMap: Record<TransactionStatus, { text: string; className: string }> = {
    new: { text: 'جديدة', className: 'bg-brand/10 text-brand-dark dark:bg-brand/20 dark:text-brand-light' },
    inProgress: { text: 'قيد الإجراء', className: 'bg-yellow-100/70 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' },
    followedUp: { text: 'متابعة', className: 'bg-primary/10 text-primary-dark dark:bg-blue-900/50 dark:text-blue-300' },
    completed: { text: 'منجزة', className: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' }
};

const platformMap: Record<TransactionPlatform, string> = {
    Bain: 'نظام بين',
    MinisterEmail: 'بريد المدير',
    HospitalEmail: 'بريد الإدارة'
};

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

const TransactionCard: React.FC<TransactionCardProps> = ({ transaction, onSelect, onCycleStatus }) => {
    const { hasPermission } = useAuth();
    
    const formattedDate = new Date(transaction.date + 'T00:00:00.000Z').toLocaleDateString('ar-SA', { day: '2-digit', month: 'short', year: 'numeric' });
    const statusInfo = statusMap[transaction.status];
    const typeInfo = {
        incoming: { text: 'واردة', className: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' },
        outgoing: { text: 'صادرة', className: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' }
    }[transaction.type];
    const lastUpdate = formatTimestamp(transaction.updated_at || transaction.created_at);

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
            className="bg-white rounded-xl shadow-md p-3 pb-10 flex items-center gap-3 transition-all duration-300 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-primary/50 dark:hover:border-primary-light/50 cursor-pointer relative"
        >
            {hasPermission('edit_transactions') && transaction.status !== 'completed' && (
                <div className="absolute top-3 left-3 z-10">
                    <button
                        onClick={handleCycleClick}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 transition-all duration-200 transform hover:scale-110 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-400 dark:hover:bg-blue-900"
                        aria-label={`نقل إلى حالة ${nextStatusText}`}
                        title={`نقل إلى حالة "${nextStatusText}"`}
                    >
                        <ArrowRightIcon className="w-5 h-5" />
                    </button>
                </div>
            )}
            <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusInfo.className}`}>{statusInfo.text}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${typeInfo.className}`}>{typeInfo.text}</span>
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 truncate" title={transaction.transaction_number}>{transaction.transaction_number}</p>
                </div>
                
                <h3 className="font-bold text-md text-gray-800 dark:text-white">{transaction.subject}</h3>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500 dark:text-gray-400 mt-2">
                    <div className="flex items-center gap-1.5 font-medium">
                        <CalendarDaysIcon className="w-4 h-4" />
                        <span>{formattedDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium">
                        <span className="font-bold">المنصة:</span>
                        <span>{platformMap[transaction.platform]}</span>
                    </div>
                    {transaction.attachment && (
                        <div className="flex items-center gap-1 text-primary dark:text-primary-light font-bold">
                            <PaperClipIcon className="w-4 h-4" />
                            <span>يوجد مرفق</span>
                        </div>
                    )}
                    {transaction.linked_employee && (
                        <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold">
                            <UserIcon className="w-4 h-4" />
                            <span>مرتبطة بموظف</span>
                        </div>
                    )}
                    {transaction.linked_office_contact && (
                        <div className="flex items-center gap-1 text-indigo-500 dark:text-indigo-400 font-bold">
                            <BuildingOfficeIcon className="w-4 h-4" />
                            <span>مرتبطة بمكتب</span>
                        </div>
                    )}
                </div>
            </div>
             {lastUpdate && (
                <p className="absolute bottom-2 left-4 text-[10px] text-gray-400 dark:text-gray-500" dir="ltr">
                    Last Update: {lastUpdate}
                </p>
            )}
        </div>
    );
};

export default TransactionCard;