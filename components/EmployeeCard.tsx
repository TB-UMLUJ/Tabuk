import React from 'react';
import { Employee } from '../types';
import { IdentificationIcon, ShareIcon, EmailIcon, MapPinIcon, GlobeAltIcon } from '../icons/Icons';
import { useToast } from '../contexts/ToastContext';

interface EmployeeCardProps {
    employee: Employee;
    onSelect: () => void;
}

const getInitials = (name: string) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('');
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


const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee, onSelect }) => {
    const { addToast } = useToast();
    const lastUpdate = formatTimestamp(employee.updated_at || employee.created_at);

    const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent modal from opening
        
        const shareTextParts = [
            `بيانات موظف:`,
            `الاسم باللغة العربية: ${employee.full_name_ar}`,
        ];

        if (employee.full_name_en) shareTextParts.push(`الاسم باللغة الإنجليزية: ${employee.full_name_en}`);
        if (employee.employee_id) shareTextParts.push(`الرقم الوظيفي: ${employee.employee_id}`);
        if (employee.job_title) shareTextParts.push(`المسمى الوظيفي: ${employee.job_title}`);
        if (employee.department) shareTextParts.push(`القطاع: ${employee.department}`);
        if (employee.center) shareTextParts.push(`المركز: ${employee.center}`);
        if (employee.phone_direct) shareTextParts.push(`رقم الجوال: ${employee.phone_direct}`);
        if (employee.email && employee.email.includes('@')) shareTextParts.push(`البريد الإلكتروني: ${employee.email}`);
        if (employee.national_id) shareTextParts.push(`السجل المدني / الإقامة: ${employee.national_id}`);
        if (employee.nationality) shareTextParts.push(`الجنسية: ${employee.nationality}`);
        if (employee.gender) shareTextParts.push(`الجنس: ${employee.gender}`);
        if (employee.date_of_birth) {
            const formattedDate = new Date(employee.date_of_birth).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
            shareTextParts.push(`تاريخ الميلاد: ${formattedDate}`);
        }
        if (employee.classification_id) shareTextParts.push(`رقم التصنيف: ${employee.classification_id}`);

        const shareText = shareTextParts.join('\n');

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `بيانات الموظف: ${employee.full_name_ar}`,
                    text: shareText,
                });
            } catch (error) {
                // Silently fail if user cancels share dialog
                console.log('Share was cancelled or failed', error);
            }
        } else {
            // Fallback for browsers that don't support the Web Share API
            try {
                await navigator.clipboard.writeText(shareText);
                addToast('تم نسخ بيانات الموظف', '', 'info');
            } catch (err) {
                console.error('Failed to copy: ', err);
                addToast('خطأ', 'فشل نسخ البيانات', 'error');
            }
        }
    };

    return (
        <div 
            onClick={onSelect} 
            className="bg-white rounded-xl shadow-md p-3 pb-10 flex items-start gap-3 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative group dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
        >
             <div className="absolute top-3 left-3">
                 <button
                    onClick={handleShare}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-accent/10 text-accent transition-all duration-200 transform hover:scale-110 dark:bg-accent/20 dark:text-accent-dark"
                    aria-label="مشاركة بيانات الموظف"
                    title="مشاركة"
                >
                    <ShareIcon className="w-5 h-5" />
                </button>
            </div>

            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0 flex items-center justify-center border-4 border-gray-100 dark:border-gray-700">
                <span className="text-xl sm:text-2xl font-bold text-brand dark:text-brand-light">{getInitials(employee.full_name_ar || '')}</span>
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base text-gray-800 dark:text-white truncate" title={employee.full_name_ar}>{employee.full_name_ar}</h3>
                <p className="mt-1 text-xs font-semibold inline-block py-1 px-2.5 rounded-full bg-accent/10 text-accent dark:bg-accent/20 dark:text-accent-dark truncate" title={employee.job_title}>{employee.job_title}</p>
                
                <div className="text-xs text-gray-500 mt-2 space-y-2 dark:text-gray-400">
                    {/* Row 1: Employee ID and Center */}
                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-1.5 min-w-0">
                            <IdentificationIcon className="w-3.5 h-3.5 flex-shrink-0"/>
                            <span className="truncate" title={`الرقم الوظيفي: ${employee.employee_id}`}>{employee.employee_id}</span>
                        </div>
                        {employee.center && (
                            <div className="flex items-center gap-1.5 min-w-0">
                                <MapPinIcon className="w-3.5 h-3.5 flex-shrink-0"/>
                                <span className="truncate" title={`المركز: ${employee.center}`}>{employee.center}</span>
                            </div>
                        )}
                    </div>

                    {/* Row 2: National ID, Nationality and Email */}
                    {(employee.national_id || employee.nationality || (employee.email && employee.email.includes('@'))) && (
                        <div className="flex items-center gap-4 flex-wrap">
                            {employee.national_id && (
                               <div className="flex items-center gap-1.5 min-w-0">
                                   <IdentificationIcon className="w-3.5 h-3.5 flex-shrink-0"/>
                                   <span className="truncate" title={`السجل المدني / الإقامة: ${employee.national_id}`}>{employee.national_id}</span>
                               </div>
                            )}
                            {employee.nationality && (
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <GlobeAltIcon className="w-3.5 h-3.5 flex-shrink-0"/>
                                    <span className="truncate" title={`الجنسية: ${employee.nationality}`}>{employee.nationality}</span>
                                </div>
                            )}
                            {employee.email && employee.email.includes('@') && (
                                <a
                                    href={`mailto:${employee.email}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex items-center gap-1.5 min-w-0 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light transition-colors"
                                >
                                    <EmailIcon className="w-3.5 h-3.5 flex-shrink-0"/>
                                    <span className="truncate" title={employee.email} dir="ltr">{employee.email}</span>
                                </a>
                            )}
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

export default EmployeeCard;