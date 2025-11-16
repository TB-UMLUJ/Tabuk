
import React from 'react';
import { Task } from '../types';
import { 
    CalendarDaysIcon, 
    CheckIcon, 
    ExclamationTriangleIcon, 
    ClockIcon, 
    CheckCircleIcon,
    ArrowPathIcon
} from '../icons/Icons';

interface TaskCardProps {
    task: Task;
    onToggleComplete: (taskId: number) => void;
    onSelect: () => void;
}

const getDueDateStatus = (dueDate: string | undefined, isCompleted: boolean): { text: string; colorClass: string; icon: React.ReactNode } | null => {
    if (isCompleted || !dueDate) {
        return null;
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const taskDueDate = new Date(dueDate + 'T00:00:00.000Z');

    const diffTime = taskDueDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
        const days = Math.abs(diffDays);
        const dayWord = days === 1 ? 'يوم' : days === 2 ? 'يومين' : (days >= 3 && days <= 10) ? 'أيام' : 'يوماً';
        return {
            text: `متأخرة منذ ${days} ${dayWord}`,
            colorClass: 'text-danger dark:text-red-400',
            icon: <ExclamationTriangleIcon className="w-4 h-4" />
        };
    } else if (diffDays === 0) {
        return {
            text: 'تستحق اليوم',
            colorClass: 'text-amber-600 dark:text-amber-400',
            icon: <ClockIcon className="w-4 h-4" />
        };
    } else {
        const formattedDate = new Date(dueDate + 'T00:00:00.000Z').toLocaleDateString('ar-SA', { calendar: 'gregory', month: 'long', day: 'numeric' });
        return {
            text: `تستحق في ${formattedDate}`,
            colorClass: 'text-gray-500 dark:text-gray-400',
            icon: <CalendarDaysIcon className="w-4 h-4" />
        };
    }
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onToggleComplete, onSelect }) => {
    const dueDateStatus = getDueDateStatus(task.due_date, task.is_completed);

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleComplete(task.id);
    };

    return (
        <div 
            onClick={onSelect}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg hover:border-primary/50 dark:hover:border-primary-light/50 hover:-translate-y-1 hover:scale-[1.03] transition-all duration-300 flex flex-col justify-between"
        >
            <div className="p-4">
                <div className="flex justify-between items-start gap-2">
                    <h3 className={`font-bold text-md text-gray-800 dark:text-white flex-1 ${task.is_completed ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
                        {task.title}
                    </h3>
                    {task.is_completed ? (
                         <span className="flex-shrink-0 text-xs font-bold px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 flex items-center gap-1">
                            <CheckCircleIcon className="w-3.5 h-3.5" /> مكتملة
                        </span>
                    ) : (
                         <span className="flex-shrink-0 text-xs font-bold px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300 flex items-center gap-1">
                            <ClockIcon className="w-3.5 h-3.5" /> قيد التنفيذ
                        </span>
                    )}
                </div>

                {task.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">{task.description}</p>}
                
                {dueDateStatus && (
                    <div className={`flex items-center gap-1.5 text-xs font-semibold mt-3 ${dueDateStatus.colorClass}`}>
                        {dueDateStatus.icon}
                        <span>{dueDateStatus.text}</span>
                    </div>
                )}
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700 rounded-b-xl">
                 <button
                    onClick={handleToggle}
                    className={`btn w-full gap-2 ${
                        task.is_completed
                            ? 'btn-secondary'
                            : 'btn-muted'
                    }`}
                    aria-label={task.is_completed ? "إعادة فتح المهمة" : "إكمال المهمة"}
                >
                    {task.is_completed ? (
                        <>
                            <ArrowPathIcon className="w-4 h-4" />
                            <span>إعادة فتح</span>
                        </>
                    ) : (
                        <>
                            <CheckIcon className="w-4 h-4" />
                            <span>إكمال المهمة</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default TaskCard;
