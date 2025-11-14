
import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { Employee, Certificate, EmployeeDocument } from '../types';
// FIX: Import ContactMailIcon to resolve 'Cannot find name' error.
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
    ExclamationTriangleIcon,
    DocumentTextIcon,
    DocumentDuplicateIcon,
    ContactMailIcon
} from '../icons/Icons';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

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

const InfoCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 mb-6 border border-gray-200 dark:border-gray-700">
        <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            {icon}
            <span>{title}</span>
        </h3>
        {children}
    </div>
);


const EmployeeProfileModal: React.FC<EmployeeProfileModalProps> = ({ isOpen, employee, onClose, onEdit, onDelete }) => {
    const { hasPermission } = useAuth();
    const { addToast } = useToast();
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

    const handleCall = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (employee?.phone_direct) {
            window.location.href = `tel:${employee.phone_direct}`;
        }
    }, [employee]);
    
    const isValidEmail = (email: string | undefined) => email && email.includes('@');

    const handleCopy = useCallback((text: string, label: string) => {
        navigator.clipboard.writeText(text).then(() => {
            addToast(`تم نسخ ${label}`, '', 'info');
        }).catch(err => {
            addToast('فشل النسخ', 'لم نتمكن من نسخ النص.', 'error');
        });
    }, [addToast]);


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
    
    const InfoRow: React.FC<{ label: string; value: string | undefined; icon: React.ReactNode; }> = ({ label, value, icon }) => {
        if (!value) return null;

        return (
            <div className="flex items-start gap-3 py-2.5">
                <div className="text-primary dark:text-primary-light mt-1">{icon}</div>
                <div>
                    <p className="text-sm text-gray-500 font-medium dark:text-gray-400">{label}</p>
                    <p className="text-base font-semibold text-gray-800 dark:text-white break-all">{value}</p>
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
            className="fixed inset-0 z-50 flex justify-center items-center"
            role="dialog"
            aria-modal="true"
        >
            <div
                className={`fixed inset-0 bg-black/60 ${isClosing ? 'animate-backdrop-out' : 'animate-backdrop-in'}`}
                onClick={handleClose}
                aria-hidden="true"
            />
            <div
                className={`relative bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-2xl h-full sm:h-auto sm:max-h-[90vh] flex flex-col transform ${isClosing ? 'animate-modal-out' : 'animate-modal-in'}`}
            >
                {/* Header */}
                <div className="relative flex-shrink-0">
                    <div className="h-36 bg-gradient-to-br from-primary to-accent/50 dark:from-gray-800 dark:to-gray-700 rounded-t-2xl"></div>
                     <button onClick={handleClose} className="absolute top-4 left-4 text-white/80 hover:text-white transition-all duration-300 z-20 p-2 bg-black/20 rounded-full hover:bg-black/40 transform hover:rotate-90">
                       <CloseIcon className="w-6 h-6" />
                    </button>
                    {(hasPermission('edit_employees') || hasPermission('delete_employees')) && (
                        <div className="absolute top-4 right-4 flex gap-2 z-20">
                            {hasPermission('edit_employees') && (
                                <button onClick={handleEdit} className="p-2.5 rounded-full bg-black/20 text-white/80 hover:bg-black/40 hover:text-white transition-all" aria-label="تعديل" title="تعديل">
                                    <PencilIcon className="w-5 h-5" />
                                </button>
                            )}
                            {hasPermission('delete_employees') && (
                                <button onClick={handleDelete} className="p-2.5 rounded-full bg-black/20 text-white/80 hover:bg-black/40 hover:text-white transition-all" aria-label="حذف" title="حذف">
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    )}
                    <div className="absolute top-[calc(9rem-4rem)] left-1/2 -translate-x-1/2 w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-lg">
                        <span className="text-5xl font-bold text-primary dark:text-primary-light">{getInitials(employee.full_name_ar || '')}</span>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-grow overflow-y-auto">
                    <div className="pt-20 px-6 pb-6">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{employee.full_name_ar}</h2>
                            <p className="text-base text-gray-500 font-semibold dark:text-gray-400 mt-1">{employee.job_title}</p>
                            <p className="text-sm text-gray-400 dark:text-gray-500">{employee.full_name_en}</p>
                        </div>
                        
                        {/* Contact Info */}
                        <InfoCard title="معلومات الاتصال" icon={<ContactMailIcon className="w-6 h-6 text-primary" />}>
                           <div className="space-y-4">
                               <div className="flex justify-between items-center">
                                   <div className="flex items-center gap-3">
                                       <PhoneIcon className="w-5 h-5 text-gray-400"/>
                                       <span className="font-semibold text-gray-700 dark:text-gray-300">{employee.phone_direct || 'غير متوفر'}</span>
                                   </div>
                                   <button onClick={handleCall} disabled={!employee.phone_direct} className="btn btn-sm btn-muted px-4 py-1.5 disabled:opacity-50">اتصال</button>
                               </div>
                               <div className="flex justify-between items-center">
                                   <div className="flex items-center gap-3 min-w-0">
                                       <EmailIcon className="w-5 h-5 text-gray-400"/>
                                       <span className="font-semibold text-gray-700 dark:text-gray-300 truncate" dir="ltr">{employee.email || 'غير متوفر'}</span>
                                   </div>
                                   <button onClick={() => handleCopy(employee.email || '', 'البريد الإلكتروني')} disabled={!isValidEmail(employee.email)} className="btn btn-sm btn-muted px-4 py-1.5 gap-1.5 disabled:opacity-50"><DocumentDuplicateIcon className="w-4 h-4"/> نسخ</button>
                               </div>
                           </div>
                        </InfoCard>

                        {/* Basic Info */}
                        <InfoCard title="المعلومات الأساسية" icon={<UserIcon className="w-6 h-6 text-primary"/>}>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 border-t border-gray-100 dark:border-gray-700">
                                <InfoRow label="الرقم الوظيفي" value={employee.employee_id} icon={<IdentificationIcon className="w-5 h-5"/>}/>
                                <InfoRow label="السجل المدني / الإقامة" value={employee.national_id} icon={<IdentificationIcon className="w-5 h-5"/>}/>
                                <InfoRow label="الجنسية" value={employee.nationality} icon={<GlobeAltIcon className="w-5 h-5"/>}/>
                                <InfoRow label="الجنس" value={employee.gender} icon={<UsersIcon className="w-5 h-5"/>}/>
                                <InfoRow label="تاريخ الميلاد" value={employee.date_of_birth ? new Date(employee.date_of_birth).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' }) : undefined} icon={<CakeIcon className="w-5 h-5"/>}/>
                            </div>
                        </InfoCard>

                        {/* Job Info */}
                        <InfoCard title="المعلومات الوظيفية" icon={<BriefcaseIcon className="w-6 h-6 text-primary"/>}>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 border-t border-gray-100 dark:border-gray-700">
                                <InfoRow label="القطاع" value={employee.department} icon={<BuildingOfficeIcon className="w-5 h-5"/>}/>
                                <InfoRow label="المركز" value={employee.center} icon={<BuildingOfficeIcon className="w-5 h-5"/>}/>
                                <InfoRow label="رقم التصنيف" value={employee.classification_id} icon={<DocumentCheckIcon className="w-5 h-5"/>}/>
                            </div>
                        </InfoCard>

                        {/* Certificates */}
                        <div className="mb-6">
                            <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-4 flex items-center gap-2"><AcademicCapIcon className="w-6 h-6 text-primary" /> الشهادات</h3>
                            {employee.certificates && employee.certificates.length > 0 ? (
                                <ul className="space-y-3">
                                    {employee.certificates.map((cert: Certificate) => {
                                        const isExpired = cert.expiry_date && new Date(cert.expiry_date) < new Date();
                                        return (
                                            <li key={cert.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                                <div className="flex items-center gap-3">
                                                    {isExpired ? (
                                                        <div className="flex-shrink-0 p-2 bg-red-100 dark:bg-red-900/50 rounded-full" title="منتهية الصلاحية">
                                                            <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                                                        </div>
                                                    ) : (
                                                        <div className="flex-shrink-0 p-2 bg-green-100 dark:bg-green-900/50 rounded-full" title="سارية">
                                                            <AcademicCapIcon className="w-5 h-5 text-green-500" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-bold text-gray-800 dark:text-white">{cert.type === 'Other' ? cert.custom_name : cert.type}</p>
                                                        {cert.expiry_date && (
                                                            <p className={`text-sm flex items-center gap-1 ${isExpired ? 'text-red-500 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
                                                                <CalendarDaysIcon className="w-4 h-4" />
                                                                تنتهي في: {new Date(cert.expiry_date).toLocaleDateString('ar-SA')}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                {cert.file_url && (
                                                    <a href={cert.file_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg text-primary hover:bg-primary/10 transition-colors dark:text-white dark:hover:bg-white/10" title={`تحميل ملف: ${cert.display_file_name || cert.type}`}>
                                                        <DocumentArrowDownIcon className="w-6 h-6" />
                                                    </a>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 text-center py-4 bg-white dark:bg-gray-800 rounded-lg border border-dashed dark:border-gray-700">لا توجد شهادات مسجلة.</p>
                            )}
                        </div>

                        {/* Documents */}
                        <div>
                            <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-4 flex items-center gap-2"><DocumentTextIcon className="w-6 h-6 text-primary" /> ملفات الموظف</h3>
                             {employee.documents && employee.documents.length > 0 ? (
                                <ul className="space-y-3">
                                    {employee.documents.map((doc: EmployeeDocument) => (
                                        <li key={doc.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center gap-3">
                                                 <div className="flex-shrink-0 p-2 bg-gray-100 dark:bg-gray-700/50 rounded-full">
                                                    <DocumentTextIcon className="w-5 h-5 text-gray-500" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800 dark:text-white">{doc.name}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{doc.uploaded_at ? `تاريخ الرفع: ${new Date(doc.uploaded_at).toLocaleDateString('ar-SA')}` : ''}</p>
                                                </div>
                                            </div>
                                            {doc.file_url && (
                                                <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg text-primary hover:bg-primary/10 transition-colors dark:text-white dark:hover:bg-white/10" title={`تحميل ملف: ${doc.display_file_name || doc.name}`}>
                                                    <DocumentArrowDownIcon className="w-6 h-6" />
                                                </a>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 text-center py-4 bg-white dark:bg-gray-800 rounded-lg border border-dashed dark:border-gray-700">لا توجد ملفات مرفوعة.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        modalRoot
    );
};

export default EmployeeProfileModal;
