

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { CloseIcon, Cog6ToothIcon } from '../icons/Icons';
import ToggleSwitch from './ToggleSwitch';

interface DashboardSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    visibleCharts: {
        departmentDistribution: boolean;
        jobTitleDistribution: boolean;
    };
    onToggleChart: (chartKey: 'departmentDistribution' | 'jobTitleDistribution') => void;
}

const DashboardSettingsModal: React.FC<DashboardSettingsModalProps> = ({ isOpen, onClose, visibleCharts, onToggleChart }) => {
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300);
    };

    if (!isOpen) return null;

    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;

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
                            <Cog6ToothIcon className="w-8 h-8"/>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-primary dark:text-white">تخصيص لوحة المعلومات</h2>
                            <p className="text-gray-500 dark:text-gray-400">اختر الإحصائيات التي تريد عرضها.</p>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                             <label htmlFor="department-toggle" className="font-semibold text-gray-700 dark:text-gray-300">
                                توزيع الموظفين حسب القطاع
                            </label>
                            <ToggleSwitch
                                checked={visibleCharts.departmentDistribution}
                                onChange={() => onToggleChart('departmentDistribution')}
                                ariaLabel="Toggle department distribution chart"
                            />
                        </div>
                         <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                             <label htmlFor="job-title-toggle" className="font-semibold text-gray-700 dark:text-gray-300">
                                توزيع الموظفين حسب المسمى الوظيفي
                            </label>
                            <ToggleSwitch
                                checked={visibleCharts.jobTitleDistribution}
                                onChange={() => onToggleChart('jobTitleDistribution')}
                                ariaLabel="Toggle job title distribution chart"
                            />
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end">
                        <button onClick={handleClose} className="bg-primary text-white font-semibold py-2 px-6 rounded-lg hover:bg-primary-dark transition-all duration-200 transform hover:-translate-y-0.5">
                            تم
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        modalRoot
    );
};

export default DashboardSettingsModal;