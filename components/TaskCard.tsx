import React from 'react';
import { Task } from '../types';
import { CalendarDaysIcon, CheckIcon } from '../icons/Icons';

interface TaskCardProps {
    task: Task;
    onToggleComplete: (taskId: number) => void;
    onSelect: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onToggleComplete, onSelect }) => {
    const formattedDate = task.due_date 
        ? new Date(task.due_date + 'T00:00:00.000Z').toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })
        : null;

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleComplete(task.id);
    };

    return (
        <div 
            onClick={onSelect}
            className={`bg-white rounded-xl shadow-md p-4 flex items-start gap-4 transition-all duration-300 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg hover:border-primary/50 dark:hover:border-primary-light/50 ${task.is_completed ? 'opacity-60' : ''}`}
        >
            <button
                onClick={handleToggle}
                className={`w-6 h-6 flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-all duration-200 mt-1 ${
                    task.is_completed
                        ? 'bg-primary border-primary text-white'
                        : 'bg-gray-100 border-gray-300 text-transparent hover:border-primary dark:bg-gray-700 dark:border-gray-500 dark:hover:border-primary-light'
                }`}
                aria-label={task.is_completed ? "إلغاء إكمال المهمة" : "إكمال المهمة"}
            >
                <CheckIcon className="w-4 h-4" />
            </button>

            <div className="flex-1 min-w-0">
                <h3 className={`font-bold text-md text-gray-800 dark:text-white ${task.is_completed ? 'line-through' : ''}`}>{task.title}</h3>
                {task.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{task.description}</p>}
                
                {formattedDate && (
                    <div className="flex items-center gap-1.5 text-xs text-accent-dark dark:text-accent-light font-semibold mt-2">
                        <CalendarDaysIcon className="w-4 h-4" />
                        <span>{formattedDate}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskCard;