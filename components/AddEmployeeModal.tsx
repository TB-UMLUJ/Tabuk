import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Employee, Certificate, CertificateTypes, EmployeeDocument } from '../types';
import { CloseIcon, UserPlusIcon, AcademicCapIcon, TrashIcon, PlusIcon, DocumentTextIcon, CameraIcon, CloudArrowUpIcon } from '../icons/Icons';
import ScanDocumentModal from './ScanDocumentModal';
import { useToast } from '../contexts/ToastContext';


interface AddEmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (employee: Omit<Employee, 'id'> & { id?: number }) => Promise<void>;
    employeeToEdit: Employee | null;
}

const initialEmployeeState: Omit<Employee, 'id' | 'date_of_birth' | 'certificates' | 'documents'> & { date_of_birth: string } = {
    full_name_ar: '',
    full_name_en: '',
    employee_id: '',
    job_title: '',
    department: 'تجمع تبوك / مستشفى أملج',
    phone_direct: '',
    email: '',
    center: '',
    national_id: '',
    nationality: '',
    gender: '',
    date_of_birth: '',
    classification_id: '',
};

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

const FormInput: React.FC<FormInputProps> = ({ label, name, required = false, type = "text", ...props }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}{required && <span className="text-danger mr-1">*</span>}
        </label>
        <input
            id={name}
            name={name}
            type={type}
            required={required}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 disabled:bg-gray-200 disabled:text-gray-500 dark:disabled:bg-gray-600 dark:disabled:text-gray-400 disabled:cursor-not-allowed ${type === 'date' ? 'text-center' : ''}`}
            {...props}
        />
    </div>
);

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ isOpen, onClose, onSave, employeeToEdit }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [activeTab, setActiveTab] = useState<'info' | 'certificates' | 'documents'>('info');
    const [employeeData, setEmployeeData] = useState(initialEmployeeState);
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
    const [emailError, setEmailError] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [scanningDocId, setScanningDocId] = useState<string | null>(null);
    const { addToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [activeDocId, setActiveDocId] = useState<string | null>(null);
    const isMobile = useMemo(() => /Mobi/i.test(window.navigator.userAgent), []);

    const validateEmail = (email: string): string => {
        if (!email) return ''; 
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.toLowerCase())) {
            return 'البريد الإلكتروني غير صالح.';
        }
        return '';
    };

    useEffect(() => {
        if (employeeToEdit) {
            const { certificates: certs, documents: docs, ...rest } = employeeToEdit;
            setEmployeeData({
                ...initialEmployeeState,
                ...rest,
                date_of_birth: employeeToEdit.date_of_birth ? new Date(employeeToEdit.date_of_birth).toISOString().split('T')[0] : '',
            });
            setCertificates(certs?.map(c => ({ ...c, id: c.id || crypto.randomUUID() })) || []);
            setDocuments(docs?.map(d => ({ ...d, id: d.id || crypto.randomUUID() })) || []);
            setEmailError(validateEmail(employeeToEdit.email || ''));
        } else {
            setEmployeeData(initialEmployeeState);
            setCertificates([]);
            setDocuments([]);
            setEmailError('');
        }
        setActiveTab('info');
    }, [employeeToEdit, isOpen]);

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
        if (isSaving) return;
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'email') {
            setEmailError(validateEmail(value));
        }
        setEmployeeData(prev => ({ ...prev, [name]: value }));
    };

    // Certificate Handlers
    const handleAddCertificate = () => setCertificates(prev => [...prev, { id: crypto.randomUUID(), type: 'BLS', custom_name: '', expiry_date: '' }]);
    const handleCertificateChange = (id: string, field: keyof Certificate, value: any) => setCertificates(prev => prev.map(c => c.id === id ? { ...c, [field]: value, custom_name: field === 'type' && value !== 'Other' ? '' : c.custom_name } : c));
    const handleCertificateFileChange = (id: string, file: File | null) => setCertificates(prev => prev.map(c => c.id === id ? { ...c, file: file || undefined, display_file_name: file ? file.name : c.display_file_name } : c));
    const handleRemoveCertificate = (id: string) => setCertificates(prev => prev.filter(c => c.id !== id));

    // Document Handlers
    const handleAddDocument = () => setDocuments(prev => [...prev, { id: crypto.randomUUID(), name: '' }]);
    const handleDocumentChange = (id: string, field: keyof EmployeeDocument, value: any) => setDocuments(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d));
    const handleDocumentFileChange = (id: string, file: File | null) => setDocuments(prev => prev.map(d => d.id === id ? { ...d, file: file || undefined, display_file_name: file ? file.name : d.display_file_name } : d));
    const handleRemoveDocument = (id: string) => setDocuments(prev => prev.filter(d => d.id !== id));
    
    const handleAttachClick = (docId: string) => {
        setActiveDocId(docId);
        if (isMobile) {
            setScanningDocId(docId);
        } else {
            fileInputRef.current?.click();
        }
    };
    
    const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (activeDocId) {
            handleDocumentFileChange(activeDocId, e.target.files?.[0] || null);
        }
        if(e.target) e.target.value = '';
        setActiveDocId(null);
    };

    const handleScanComplete = (file: File) => {
        if (scanningDocId) {
            handleDocumentFileChange(scanningDocId, file);
            addToast('تم المسح بنجاح!', 'تم إرفاق المستند وجاهز للحفظ.', 'scan_success');
        }
        setScanningDocId(null);
        setActiveDocId(null);
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const currentEmailError = validateEmail(employeeData.email);
        if (currentEmailError) {
            setEmailError(currentEmailError);
            return;
        }

        if (isSaving) return;
        setIsSaving(true);

        const dataToSave = { ...employeeData };

        for (const key in dataToSave) {
            const typedKey = key as keyof typeof dataToSave;
            if (typeof dataToSave[typedKey] === 'string') {
                (dataToSave as any)[typedKey] = (dataToSave[typedKey] as string).trim();
            }
        }

        const finalData: Omit<Employee, 'id'> & { id?: number } = {
            ...dataToSave,
            date_of_birth: dataToSave.date_of_birth ? new Date(dataToSave.date_of_birth + 'T00:00:00.000Z').toISOString() : undefined,
            id: employeeToEdit?.id,
            center: dataToSave.center || undefined,
            national_id: dataToSave.national_id || undefined,
            nationality: dataToSave.nationality || undefined,
            gender: dataToSave.gender || undefined,
            classification_id: dataToSave.classification_id || undefined,
            certificates: certificates,
            documents: documents,
        };

        try {
            await onSave(finalData);
        } catch (error) {
            console.error("Save failed:", error);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;
    
    const isEditMode = !!employeeToEdit;
    
    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-50 flex justify-center items-center p-4" role="dialog" aria-modal="true">
            <div
                className={`fixed inset-0 bg-black/60 ${isClosing ? 'animate-backdrop-out' : 'animate-backdrop-in'}`}
                onClick={handleClose}
                aria-hidden="true"
            />
            <div className={`relative bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto overflow-x-hidden transform ${isClosing ? 'animate-modal-out' : 'animate-modal-in'} dark:bg-gray-800`}>
                <input type="file" ref={fileInputRef} onChange={handleFileSelected} className="hidden" accept="image/jpeg,image/png,application/pdf,.doc,.docx" />

                <ScanDocumentModal
                    isOpen={scanningDocId !== null}
                    onClose={() => setScanningDocId(null)}
                    onScanComplete={handleScanComplete}
                />

                <div className="p-6 md:p-8">
                    <button onClick={handleClose} className="absolute top-4 left-4 text-gray-400 hover:text-gray-800 transition-all duration-300 z-10 p-2 bg-gray-100/50 rounded-full dark:bg-gray-700/50 dark:text-gray-300 dark:hover:text-white hover:bg-gray-200/80 transform hover:rotate-90">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                    
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-primary-light p-3 rounded-lg text-primary dark:bg-primary/20 dark:text-primary-light">
                            <UserPlusIcon className="w-8 h-8"/>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-primary dark:text-white">{isEditMode ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد'}</h2>
                            <p className="text-gray-500 dark:text-gray-400">{isEditMode ? 'قم بتحديث البيانات المطلوبة.' : 'املأ الحقول المطلوبة لإضافة موظف إلى الدليل.'}</p>
                        </div>
                    </div>
                    
                    <form onSubmit={handleSubmit}>
                         <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                                <button type="button" onClick={() => setActiveTab('info')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm ${activeTab === 'info' ? 'border-primary text-primary dark:border-primary-light dark:text-primary-light' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}>المعلومات الأساسية</button>
                                <button type="button" onClick={() => setActiveTab('certificates')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm ${activeTab === 'certificates' ? 'border-primary text-primary dark:border-primary-light dark:text-primary-light' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}>الشهادات</button>
                                <button type="button" onClick={() => setActiveTab('documents')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm ${activeTab === 'documents' ? 'border-primary text-primary dark:border-primary-light dark:text-primary-light' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}>ملفات الموظف</button>
                            </nav>
                        </div>

                        {activeTab === 'info' && (
                            <div className="space-y-6 animate-fade-in">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">المعلومات الأساسية</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FormInput label="الاسم باللغة العربية" name="full_name_ar" value={employeeData.full_name_ar} onChange={handleChange} />
                                        <FormInput label="الاسم باللغة الإنجليزية" name="full_name_en" value={employeeData.full_name_en} onChange={handleChange} />
                                        <FormInput label="الرقم الوظيفي" name="employee_id" value={employeeData.employee_id} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-5">
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">المعلومات الوظيفية</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FormInput label="المسمى الوظيفي" name="job_title" value={employeeData.job_title} onChange={handleChange} />
                                        <FormInput label="القطاع" name="department" value={employeeData.department} onChange={handleChange} disabled />
                                        <FormInput label="المركز" name="center" value={employeeData.center || ''} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-5">
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">معلومات الاتصال</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormInput label="رقم الجوال" name="phone_direct" type="tel" value={employeeData.phone_direct} onChange={handleChange} />
                                        <div>
                                            <FormInput label="البريد الإلكتروني" name="email" type="email" value={employeeData.email} onChange={handleChange} />
                                            {emailError && <p className="text-danger text-xs mt-1">{emailError}</p>}
                                        </div>
                                    </div>
                                </div>
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-5">
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">المعلومات الشخصية</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FormInput label="السجل المدني / الإقامة" name="national_id" value={employeeData.national_id || ''} onChange={handleChange} />
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormInput label="الجنسية" name="nationality" value={employeeData.nationality || ''} onChange={handleChange} />
                                            <div>
                                                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الجنس</label>
                                                <select id="gender" name="gender" value={employeeData.gender} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"><option value="">اختر الجنس</option><option value="ذكر">ذكر</option><option value="أنثى">أنثى</option></select>
                                            </div>
                                        </div>
                                        <FormInput label="تاريخ الميلاد" name="date_of_birth" type="date" value={employeeData.date_of_birth} onChange={handleChange} />
                                        <FormInput label="رقم التصنيف" name="classification_id" value={employeeData.classification_id || ''} onChange={handleChange} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'certificates' && (
                             <div className="animate-fade-in">
                                <div className="flex items-center gap-2 mb-4">
                                    <AcademicCapIcon className="w-6 h-6 text-primary" />
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">الشهادات والتراخيص</h3>
                                </div>
                                <div className="space-y-4">
                                    {certificates.map((cert) => (
                                        <div key={cert.id} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 border dark:border-gray-600 relative group">
                                            <button type="button" onClick={() => handleRemoveCertificate(cert.id)} className="absolute top-3 left-3 p-1 text-gray-400 hover:text-danger rounded-full hover:bg-danger/10 transition-colors" title="إزالة الشهادة"><TrashIcon className="w-5 h-5"/></button>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">نوع الشهادة</label>
                                                    <select value={cert.type} onChange={(e) => handleCertificateChange(cert.id, 'type', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white dark:bg-gray-700 dark:border-gray-500 focus:outline-none focus:ring-1 focus:ring-primary">{CertificateTypes.map(t => <option key={t} value={t}>{t}</option>)}</select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">تاريخ الانتهاء</label>
                                                    <input type="date" value={cert.expiry_date || ''} onChange={(e) => handleCertificateChange(cert.id, 'expiry_date', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white dark:bg-gray-700 dark:border-gray-500 focus:outline-none focus:ring-1 focus:ring-primary text-center"/>
                                                </div>
                                                <div className={`sm:col-span-2 ${cert.type === 'Other' ? 'block' : 'hidden'}`}>
                                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">الاسم المخصص (عند اختيار "Other")</label>
                                                    <input type="text" value={cert.custom_name || ''} required={cert.type === 'Other'} onChange={(e) => handleCertificateChange(cert.id, 'custom_name', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white dark:bg-gray-700 dark:border-gray-500 focus:outline-none focus:ring-1 focus:ring-primary"/>
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">ملف الشهادة (اختياري)</label>
                                                    <div className="flex items-center gap-4">
                                                        <label htmlFor={`cert-file-${cert.id}`} className="cursor-pointer bg-primary/10 text-primary font-semibold py-2 px-4 rounded-lg hover:bg-primary/20 transition-all duration-200 dark:bg-primary/20 dark:text-primary-light dark:hover:bg-primary/30 whitespace-nowrap text-sm">اختر ملف</label>
                                                        <input id={`cert-file-${cert.id}`} type="file" className="hidden" onChange={(e) => handleCertificateFileChange(cert.id, e.target.files ? e.target.files[0] : null)} />
                                                        <span className="text-sm text-gray-500 dark:text-gray-400 truncate">{cert.file ? cert.file.name : (cert.display_file_name || 'لم يتم تحديد أي ملف')}</span>
                                                    </div>
                                                    {cert.display_file_name && !cert.file && (<a href={cert.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 dark:text-blue-400 hover:underline truncate mt-1 inline-block">عرض الملف الحالي: {cert.display_file_name}</a>)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button type="button" onClick={handleAddCertificate} className="mt-4 flex items-center gap-2 bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light font-semibold py-2 px-4 rounded-lg hover:bg-primary/20 transition-all duration-200"><PlusIcon className="w-5 h-5" />إضافة شهادة</button>
                            </div>
                        )}
                        
                        {activeTab === 'documents' && (
                             <div className="animate-fade-in">
                                <div className="flex items-center gap-2 mb-4">
                                    <DocumentTextIcon className="w-6 h-6 text-primary" />
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">ملفات الموظف</h3>
                                </div>
                                <div className="space-y-4">
                                    {documents.map((doc) => (
                                        <div key={doc.id} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 border dark:border-gray-600 relative group">
                                            <button type="button" onClick={() => handleRemoveDocument(doc.id)} className="absolute top-3 left-3 p-1 text-gray-400 hover:text-danger rounded-full hover:bg-danger/10 transition-colors" title="إزالة الملف"><TrashIcon className="w-5 h-5"/></button>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">اسم الملف</label>
                                                    <input type="text" value={doc.name || ''} required onChange={(e) => handleDocumentChange(doc.id, 'name', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white dark:bg-gray-700 dark:border-gray-500 focus:outline-none focus:ring-1 focus:ring-primary" placeholder="مثال: خطاب التعيين"/>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">الملف</label>
                                                    <div className="flex items-center gap-2">
                                                        <button type="button" onClick={() => handleAttachClick(doc.id)} className={`flex items-center gap-2 font-semibold py-2 px-4 rounded-lg transition-all duration-200 text-sm ${isMobile ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light hover:bg-primary/20' : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'}`}>
                                                          {isMobile ? <CameraIcon className="w-5 h-5" /> : <CloudArrowUpIcon className="w-5 h-5" />}
                                                          <span>{isMobile ? 'مسح مستند' : 'رفع ملف'}</span>
                                                        </button>
                                                    </div>
                                                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 truncate">
                                                        {doc.file ? doc.file.name : (doc.display_file_name || 'لم يتم تحديد أي ملف')}
                                                    </div>
                                                     {doc.display_file_name && !doc.file && (<a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 dark:text-blue-400 hover:underline truncate mt-1 inline-block">عرض الملف الحالي: {doc.display_file_name}</a>)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button type="button" onClick={handleAddDocument} className="mt-4 flex items-center gap-2 bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light font-semibold py-2 px-4 rounded-lg hover:bg-primary/20 transition-all duration-200"><PlusIcon className="w-5 h-5" />إضافة ملف</button>
                            </div>
                        )}
                        
                        <div className="mt-8 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700 pt-5">
                            <button type="button" onClick={handleClose} className="bg-gray-200 text-gray-800 font-semibold py-2 px-6 rounded-lg hover:bg-gray-300 transition-all duration-200 transform hover:-translate-y-0.5 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
                                إلغاء
                            </button>
                            <button 
                                type="submit" 
                                disabled={!!emailError || isSaving}
                                className="bg-primary text-white font-semibold py-2 px-6 rounded-lg hover:bg-primary-dark transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? 'جاري الحفظ...' : (isEditMode ? 'حفظ التغييرات' : 'حفظ الموظف')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>,
        modalRoot
    );
};

export default AddEmployeeModal;