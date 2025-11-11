import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { Employee, Certificate } from '../types';
import { 
    EmailIcon, 
    PhoneIcon, 
    CloseIcon, 
    IdentificationIcon, 
    BuildingOfficeIcon, 
    BriefcaseIcon, 
    UserIcon, 
    GlobeAltIcon, 
    UsersIcon, 
    CakeIcon, 
    DocumentCheckIcon, 
    PencilIcon, 
    TrashIcon,
    AcademicCapIcon,
    DocumentArrowDownIcon,
    CalendarDaysIcon,
    ExclamationTriangleIcon
} from '../icons/Icons';
import { useAuth } from '../contexts/AuthContext';

interface EmployeeProfileModalProps {
    isOpen: boolean;
    employee: Employee | null;
    onClose: () => void;
    onEdit: (employee: Employee) => void;
    onDelete: (employee: Employee) => void;
}

const getInitials = (name: string) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('');
};


const EmployeeProfileModal: React.FC<EmployeeProfileModalProps> = ({ isOpen, employee, onClose, onEdit, onDelete }) => {
    const { hasPermission } = useAuth();
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

    const handleClose = useCallback(() => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300);
    }, [onClose]);

    const handleCall = useCallback(() => {
        if (employee?.phone_direct) {
            window.location.href = `tel:${employee.phone_direct}`;
        }
    }, [employee]);
    
    const isValidEmail = (email: string | undefined) => email && email.includes('@');

    const handleEmail = useCallback(() => {
        if (employee?.email && isValidEmail(employee.email)) {
            window.location.href = `mailto:${employee.email}`;
        }
    }, [employee]);

    const handleEdit = useCallback(() => {
        if (employee) {
            onEdit(employee);
        }
    }, [employee, onEdit]);
    
    const handleDelete = () => {
        if (employee) {
            onDelete(employee);
        }
    };
    
    const { completionPercentage, progressBarColorClass } = useMemo(() => {
        if (!employee) return { completionPercentage: 0, progressBarColorClass: 'bg-danger' };

        const requiredFields: (keyof Employee)[] = [
            'full_name_ar', 'full_name_en', 'employee_id', 'job_title', 'department',
            'phone_direct', 'email', 'center', 'national_id', 'nationality',
            'gender', 'date_of_birth', 'classification_id'
        ];
        
        const completedCount = requiredFields.reduce((count, field) => {
            const value = employee[field];
            if (value !== null && value !== undefined && String(value).trim() !== '') {
                return count + 1;
            }
            return count;
        }, 0);

        const percentage = Math.round((completedCount / requiredFields.length) * 100);
        
        let colorClass = 'bg-danger';
        if (percentage > 80) {
            colorClass = 'bg-primary';
        } else if (percentage > 40) {
            colorClass = 'bg-yellow-500';
        }

        return { completionPercentage: percentage, progressBarColorClass: colorClass };
    }, [employee]);


    const InfoRow: React.FC<{ label: string; value: string | undefined; icon: React.ReactNode; href?: string }> = ({ label, value, icon, href }) => {
        if (!value) return null;
        
        const valueContent = href ? (
            <a href={href} className="hover:underline" target="_blank" rel="noopener noreferrer">{value}</a>
        ) : (
            value
        );

        return (
            <div className="flex items-start gap-3 py-2.5">
                <div className="bg-primary/10 p-2 rounded-lg text-primary dark:bg-primary/20 dark:text-primary mt-1">{icon}</div>
                <div>
                    <p className="text-sm text-gray-500 font-medium dark:text-gray-400">{label}</p>
                    <p className="text-base font-bold text-gray-800 dark:text-white break-all">{valueContent}</p>
                </div>
            </div>
        );
    };
    
    if (!isOpen) {
        return null;
    }

    const modalRoot = document.getElementById('modal-root');
    if (!employee || !modalRoot) return null;

    return ReactDOM.createPortal(
        <div
            className="fixed inset-0 z-50 flex justify-center items-center p-4"
            role="dialog"
            aria-modal="true"
        >
            <div
                className={`fixed inset-0 bg-black/60 ${isClosing ? 'animate-backdrop-out' : 'animate-backdrop-in'}`}
                onClick={handleClose}
                aria-hidden="true"
            />
            <div
                className={`relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform ${isClosing ? 'animate-modal-out' : 'animate-modal-in'} dark:bg-gray-800`}
            >
                 <div className="p-4 sm:p-6 md:p-8">
                    <button
                        onClick={handleClose}
                        className="absolute top-4 left-4 text-gray-400 hover:text-gray-800 transition-all duration-300 z-10 p-2 bg-gray-100/50 rounded-full dark:bg-gray-700/50 dark:text-gray-300 dark:hover:text-white hover:bg-gray-200/80 transform hover:rotate-90"
                    >
                       <CloseIcon className="w-6 h-6" />
                    </button>

                     <div className="mb-6">
                        <div className="flex justify-between items-center mb-1">
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">اكتمل الملف بنسبة:</h4>
                            <span className={`text-sm font-bold ${progressBarColorClass.replace('bg-', 'text-')}`}>{completionPercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                            <div 
                                className={`h-2.5 rounded-full transition-all duration-500 ease-out ${progressBarColorClass}`} 
                                style={{ width: `${completionPercentage}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-8 mb-6">
                        <div className="text-center flex-shrink-0">
                             <div className="w-20 h-20 md:w-32 md:h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0 flex items-center justify-center mx-auto border-4 border-gray-200 dark:border-gray-600">
                                <span className="text-4xl md:text-5xl font-bold text-brand dark:text-brand-light">{getInitials(employee.full_name_ar || '')}</span>
                            </div>
                        </div>
                        <div className="flex-1 text-center md:text-right w-full">
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{employee.full_name_ar}</h2>
                            <p className="text-base text-gray-500 font-semibold dark:text-gray-400">{employee.job_title}</p>
                            <p className="text-sm md:text-base text-gray-400 dark:text-gray-500">{employee.full_name_en}</p>
                            
                            <div className="mt-6 flex items-center justify-center md:justify-end gap-2">
                                <button
                                    onClick={handleCall}
                                    disabled={!employee.phone_direct}
                                    className="text-center bg-primary text-white p-3 rounded-lg hover:bg-primary-dark transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label="اتصال"
                                    title="اتصال"
                                >
                                    <PhoneIcon className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={handleEmail}
                                    disabled={!isValidEmail(employee.email)}
                                    className="text-center bg-gray-200 text-gray-700 p-3 rounded-lg hover:bg-gray-300 transition-all duration-200 transform hover:scale-105 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label="ارسال بريد إلكتروني"
                                    title="ارسال بريد إلكتروني"
                                >
                                     <EmailIcon className="w-6 h-6" />
                                </button>
                            
                                {(hasPermission('edit_employees') || hasPermission('delete_employees')) && (
                                    <div className="border-l h-6 border-gray-300 dark:border-gray-600 mx-1"></div>
                                )}
                                
                                {hasPermission('edit_employees') && (
                                    <button onClick={handleEdit} className="text-center bg-gray-100 text-gray-700 p-3 rounded-lg hover:bg-gray-200 transition-all duration-200 transform hover:scale-105 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600" aria-label="تعديل" title="تعديل">
                                        <PencilIcon className="w-6 h-6" />
                                    </button>
                                )}
                                {hasPermission('delete_employees') && (
                                    <button onClick={handleDelete} className="text-center bg-danger/10 text-danger p-3 rounded-lg hover:bg-danger/20 transition-all duration-200 transform hover:scale-105 dark:bg-danger/20 dark:text-red-400 dark:hover:bg-danger/30" aria-label="حذف" title="حذف">
                                        <TrashIcon className="w-6 h-6" />
                                    </button>
                                )}
                            </div>

                        </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-2 grid grid-cols-1 md:grid-cols-2 gap-x-6 dark:border-gray-700">
                        <InfoRow label="الاسم باللغة العربية" value={employee.full_name_ar} icon={<UserIcon className="w-5 h-5"/>}/>
                        <InfoRow label="الاسم باللغة الإنجليزية" value={employee.full_name_en} icon={<UserIcon className="w-5 h-5"/>}/>
                        <InfoRow label="الرقم الوظيفي" value={employee.employee_id} icon={<IdentificationIcon className="w-5 h-5"/>}/>
                        <InfoRow label="المسمى الوظيفي" value={employee.job_title} icon={<BriefcaseIcon className="w-5 h-5"/>}/>
                        <InfoRow label="القطاع" value={employee.department} icon={<BuildingOfficeIcon className="w-5 h-5"/>}/>
                        <InfoRow label="المركز" value={employee.center} icon={<BuildingOfficeIcon className="w-5 h-5"/>}/>
                        <InfoRow label="رقم الجوال" value={employee.phone_direct} icon={<PhoneIcon className="w-5 h-5"/>} href={`tel:${employee.phone_direct}`} />
                        <InfoRow label="البريد الإلكتروني" value={employee.email} icon={<EmailIcon className="w-5 h-5"/>} href={isValidEmail(employee.email) ? `mailto:${employee.email}` : undefined} />
                        <InfoRow label="السجل المدني / الإقامة" value={employee.national_id} icon={<IdentificationIcon className="w-5 h-5"/>}/>
                        <InfoRow label="الجنسية" value={employee.nationality} icon={<GlobeAltIcon className="w-5 h-5"/>}/>
                        <InfoRow label="الجنس" value={employee.gender} icon={<UsersIcon className="w-5 h-5"/>}/>
                        <InfoRow label="تاريخ الميلاد" value={employee.date_of_birth ? new Date(employee.date_of_birth).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' }) : undefined} icon={<CakeIcon className="w-5 h-5"/>}/>
                        <InfoRow label="رقم التصنيف" value={employee.classification_id} icon={<DocumentCheckIcon className="w-5 h-5"/>}/>
                    </div>

                    <div className="border-t border-gray-200 pt-4 mt-4 dark:border-gray-700">
                        <h3 className="text-base font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-3">
                            <AcademicCapIcon className="w-6 h-6 text-primary" />
                            الشهادات والتراخيص
                        </h3>
                        {employee.certificates && employee.certificates.length > 0 ? (
                            <ul className="space-y-3">
                                {employee.certificates.map((cert: Certificate) => {
                                    const isExpired = cert.expiry_date && new Date(cert.expiry_date) < new Date();
                                    return (
                                        <li key={cert.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                {/* FIX: The `title` prop is not valid on these custom Icon components. Wrap the icon in a div with a title attribute for the tooltip. */}
                                                {isExpired ? (
                                                    <div className="flex-shrink-0" title="منتهية الصلاحية">
                                                        <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
                                                    </div>
                                                ) : (
                                                    <div className="flex-shrink-0" title="سارية">
                                                        <AcademicCapIcon className="w-6 h-6 text-green-500" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-bold text-gray-800 dark:text-white">
                                                        {cert.type === 'Other' ? cert.custom_name : cert.type}
                                                    </p>
                                                    {cert.expiry_date && (
                                                        <p className={`text-sm flex items-center gap-1 ${isExpired ? 'text-red-500 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
                                                            <CalendarDaysIcon className="w-4 h-4" />
                                                            تنتهي في: {new Date(cert.expiry_date).toLocaleDateString('ar-SA')}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            {cert.file_url && (
                                                <a 
                                                    href={cert.file_url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="p-2 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                                                    title={`تحميل ملف: ${cert.display_file_name || cert.type}`}
                                                >
                                                    <DocumentArrowDownIcon className="w-6 h-6" />
                                                </a>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                                لا توجد شهادات مسجلة لهذا الموظف.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        modalRoot
    );
};

export default EmployeeProfileModal;