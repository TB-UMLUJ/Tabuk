

import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { Task } from '../types';
import { CloseIcon, PencilIcon, TrashIcon, CheckCircleIcon, XCircleIcon, BellIcon } from '../icons/Icons';
import { useAuth } from '../contexts/AuthContext';

interface TaskDetailModalProps {
    isOpen: boolean;
    task: Task | null;
    onClose: () => void;
    onEdit: (task: Task) => void;
    onDelete: (task: Task) => void;
    onToggleComplete: (taskId: number) => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ isOpen, task, onClose, onEdit, onDelete, onToggleComplete }) => {
    const [isClosing, setIsClosing] = useState(false);
    const { hasPermission } = useAuth();

    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'auto';
        return () => { document.body.style.overflow = 'auto'; };
    }, [isOpen]);

    const handleClose = useCallback(() => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300);
    }, [onClose]);

    const handleEdit = useCallback(() => {
        if (task) {
            onEdit(task);
        }
    }, [task, onEdit]);
    
    const handleDelete = () => {
        if (task) {
            onDelete(task);
        }
    };

    const handleToggle = () => {
        if (task) {
            onToggleComplete(task.id);
        }
    }

    const InfoRow: React.FC<{ label: string; value?: string; children?: React.ReactNode }> = ({ label, value, children }) => {
        if (!value && !children) return null;
        return (
            <div className="py-3">
                <p className="text-sm text-gray-500 font-medium dark:text-gray-400">{label}</p>
                {value && <p className="text-base font-semibold text-gray-800 dark:text-white break-words">{value}</p>}
                {children}
            </div>
        );
    };
    
    if (!isOpen) return null;
    const modalRoot = document.getElementById('modal-root');
    if (!task || !modalRoot) return null;

    const formattedDate = task.due_date 
        ? new Date(task.due_date + 'T00:00:00.000Z').toLocaleDateString('ar-SA', { calendar: 'gregory', year: 'numeric', month: 'long', day: 'numeric' })
        : 'غير محدد';

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-50 flex justify-center items-center p-4" role="dialog" aria-modal="true">
            <div className={`fixed inset-0 bg-black/60 ${isClosing ? 'animate-backdrop-out' : 'animate-backdrop-in'}`} onClick={handleClose} aria-hidden="true" />
            <div className={`relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform ${isClosing ? 'animate-modal-out' : 'animate-modal-in'} dark:bg-gray-800`}>
                 <div className="p-6 md:p-8">
                    <button onClick={handleClose} className="absolute top-4 left-4 text-gray-400 hover:text-gray-800 transition-all duration-300 z-10 p-2 bg-gray-100/50 rounded-full dark:bg-gray-700/50 dark:text-gray-300 dark:hover:text-white hover:bg-gray-200/80 transform hover:rotate-90">
                       <CloseIcon className="w-6 h-6" />
                    </button>

                    <div className="flex items-start gap-4 mb-4">
                        <div className="bg-primary-light p-3 rounded-lg text-primary dark:bg-primary/20 dark:text-primary-light mt-1">
                            <BellIcon className="w-8 h-8"/>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl md:text-2xl font-bold text-primary dark:text-white">{task.title}</h2>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                {task.is_completed ? (
                                    <span className="text-sm font-bold px-3 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 flex items-center gap-1">
                                        <CheckCircleIcon className="w-4 h-4" /> مكتملة
                                    </span>
                                ) : (
                                    <span className="text-sm font-bold px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 flex items-center gap-1">
                                        <XCircleIcon className="w-4 h-4" /> قيد التنفيذ
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-2 grid grid-cols-1 md:grid-cols-2 gap-x-6 dark:border-gray-700">
                        <InfoRow label="تاريخ الاستحقاق" value={formattedDate} />
                        <div className="md:col-span-2">
                            <InfoRow label="الوصف" value={task.description || 'لا يوجد وصف.'} />
                        </div>
                    </div>
                    
                    <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-between items-center">
                        <button onClick={handleToggle} className={`font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 transform hover:scale-105 ${task.is_completed ? 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500' : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-900'}`}>
                            {task.is_completed ? <XCircleIcon className="w-5 h-5"/> : <CheckCircleIcon className="w-5 h-5" />}
                            <span>{task.is_completed ? 'إعادة فتح المهمة' : 'إكمال المهمة'}</span>
                        </button>
                        <div className="flex gap-2">
                            {hasPermission('edit_tasks') && (
                                <button onClick={handleEdit} className="text-center bg-gray-100 text-gray-700 p-2.5 rounded-lg hover:bg-gray-200 transition-all duration-200 transform hover:scale-105 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600" aria-label="تعديل" title="تعديل">
                                    <PencilIcon className="w-5 h-5" />
                                </button>
                            )}
                            {hasPermission('delete_tasks') && (
                                <button onClick={handleDelete} className="text-center bg-danger/10 text-danger p-2.5 rounded-lg hover:bg-danger/20 transition-all duration-200 transform hover:scale-105 dark:bg-danger/20 dark:text-red-400 dark:hover:bg-danger/30" aria-label="حذف" title="حذف">
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>,
        modalRoot
    );
};

export default TaskDetailModal;
