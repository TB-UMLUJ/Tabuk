

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Task } from '../types';
import { CloseIcon, ClipboardDocumentCheckIcon } from '../icons/Icons';

interface AddTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (task: Omit<Task, 'id'> & { id?: number }) => void;
    taskToEdit: Task | null;
}

const initialTaskState: Omit<Task, 'id' | 'is_completed'> = {
    title: '',
    description: '',
    due_date: '',
};

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onSave, taskToEdit }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [taskData, setTaskData] = useState(initialTaskState);

    useEffect(() => {
        if (taskToEdit) {
            setTaskData({
                title: taskToEdit.title,
                description: taskToEdit.description || '',
                due_date: taskToEdit.due_date || '',
            });
        } else {
            setTaskData(initialTaskState);
        }
    }, [taskToEdit]);

    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'auto';
        return () => { document.body.style.overflow = 'auto'; };
    }, [isOpen]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setTaskData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave: Omit<Task, 'id'> & { id?: number } = {
            ...taskData,
            id: taskToEdit?.id,
            is_completed: taskToEdit ? taskToEdit.is_completed : false,
            description: taskData.description || undefined,
            due_date: taskData.due_date || undefined,
        };
        onSave(dataToSave);
    };

    if (!isOpen) return null;
    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;

    const isEditMode = !!taskToEdit;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-50 flex justify-center items-center p-4" role="dialog" aria-modal="true">
            <div
                className={`fixed inset-0 bg-black/60 ${isClosing ? 'animate-backdrop-out' : 'animate-backdrop-in'}`}
                onClick={handleClose}
                aria-hidden="true"
            />
            <div className={`relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto transform ${isClosing ? 'animate-modal-out' : 'animate-modal-in'} dark:bg-gray-800`}>
                <div className="p-6 md:p-8">
                    <button onClick={handleClose} className="absolute top-4 left-4 text-gray-400 hover:text-gray-800 transition-all duration-300 z-10 p-2 bg-gray-100/50 rounded-full dark:bg-gray-700/50 dark:text-gray-300 dark:hover:text-white hover:bg-gray-200/80 transform hover:rotate-90">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                    
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-primary-light p-3 rounded-lg text-primary dark:bg-primary/20 dark:text-primary-light">
                            <ClipboardDocumentCheckIcon className="w-8 h-8"/>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-primary dark:text-white">{isEditMode ? 'تعديل المهمة' : 'إضافة مهمة جديدة'}</h2>
                            <p className="text-gray-500 dark:text-gray-400">{isEditMode ? 'قم بتحديث تفاصيل المهمة.' : 'املأ الحقول لإضافة مهمة جديدة.'}</p>
                        </div>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                عنوان المهمة<span className="text-danger mr-1">*</span>
                            </label>
                            <input id="title" name="title" type="text" required value={taskData.title} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الوصف (اختياري)</label>
                            <textarea id="description" name="description" rows={3} value={taskData.description} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                        </div>
                        <div>
                            <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">تاريخ الاستحقاق (اختياري)</label>
                            <input id="due_date" name="due_date" type="date" value={taskData.due_date} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                        </div>
                        
                        <div className="mt-8 flex justify-end gap-3">
                            <button type="button" onClick={handleClose} className="btn btn-secondary">
                                إلغاء
                            </button>
                            <button type="submit" className="btn btn-primary">
                                {isEditMode ? 'حفظ' : 'إضافة'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>,
        modalRoot
    );
};

export default AddTaskModal;
