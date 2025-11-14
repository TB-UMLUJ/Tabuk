import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Employee, Certificate, CertificateTypes, EmployeeDocument, CertificateType } from '../types';
import { 
    CloseIcon, 
    UserIcon, 
    BriefcaseIcon,
    AcademicCapIcon,
    ContactMailIcon,
    DocumentTextIcon,
    CheckIcon,
    ArrowBackIcon,
    ArrowRightIcon,
    TrashIcon, 
    PlusIcon, 
    CameraIcon, 
    CloudArrowUpIcon,
    IdentificationIcon,
    GlobeAltIcon,
    UsersIcon,
    CakeIcon,
    BuildingOfficeIcon,
    PhoneIcon,
    EmailIcon,
    CalendarDaysIcon,
    PencilIcon,
    ChevronDownIcon,
    DocumentCheckIcon
} from '../icons/Icons';
import ScanDocumentModal from './ScanDocumentModal';
import { useToast } from '../contexts/ToastContext';

interface AddEmployeeOnboardingProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (employee: Omit<Employee, 'id'> & { id?: number }) => Promise<void>;
    employeeToEdit: Employee | null;
}

const initialEmployeeState: Omit<Employee, 'id' | 'date_of_birth'> & { date_of_birth: string, certificates: Certificate[], documents: EmployeeDocument[] } = {
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
    certificates: [],
    documents: [],
};

const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string; icon: React.ReactNode }> = ({ label, name, required, icon, ...props }) => (
    <div className="relative">
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
            {icon}
        </div>
        <input
            id={name}
            name={name}
            required={required}
            placeholder={`${label}${required ? ' *' : ''}`}
            title={`${label}${required ? ' (مطلوب)' : ''}`}
            className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            {...props}
        />
    </div>
);

const FormSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; icon: React.ReactNode; children: React.ReactNode }> = ({ label, name, required, icon, children, ...props }) => (
    <div className="relative">
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
            {icon}
        </div>
        <select
            id={name}
            name={name}
            required={required}
            title={`${label}${required ? ' (مطلوب)' : ''}`}
            className="w-full appearance-none pr-12 pl-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            {...props}
        >
            {children}
        </select>
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <ChevronDownIcon className="w-5 h-5 text-gray-400" />
        </div>
    </div>
);

const stepsConfig = [
    { id: 'basic', title: 'المعلومات الأساسية', icon: <UserIcon className="w-6 h-6" /> },
    { id: 'job', title: 'البيانات الوظيفية', icon: <BriefcaseIcon className="w-6 h-6" /> },
    { id: 'certs', title: 'المؤهلات والشهادات', icon: <AcademicCapIcon className="w-6 h-6" /> },
    { id: 'contact', title: 'بيانات التواصل', icon: <ContactMailIcon className="w-6 h-6" /> },
    { id: 'docs', title: 'ملفات الموظف', icon: <DocumentTextIcon className="w-6 h-6" /> },
];

const AddEmployeeOnboarding: React.FC<AddEmployeeOnboardingProps> = ({ isOpen, onClose, onSave, employeeToEdit }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [employeeData, setEmployeeData] = useState(initialEmployeeState);
    const [isSaving, setIsSaving] = useState(false);
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    const [scanningDocId, setScanningDocId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [activeDocId, setActiveDocId] = useState<string | null>(null);
    const { addToast } = useToast();
    const isMobile = useMemo(() => typeof window !== 'undefined' && /Mobi/i.test(window.navigator.userAgent), []);


    useEffect(() => {
        if (isOpen) {
            if (employeeToEdit) {
                setEmployeeData({
                    ...initialEmployeeState,
                    ...employeeToEdit,
                    date_of_birth: employeeToEdit.date_of_birth ? new Date(employeeToEdit.date_of_birth).toISOString().split('T')[0] : '',
                    certificates: employeeToEdit.certificates?.map(c => ({ ...c, id: c.id || crypto.randomUUID() })) || [],
                    documents: employeeToEdit.documents?.map(d => ({ ...d, id: d.id || crypto.randomUUID() })) || [],
                });
            } else {
                setEmployeeData(initialEmployeeState);
            }
            setCurrentStep(0);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }, [isOpen, employeeToEdit]);

    const handleClose = () => {
        if (isSaving) return;
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300);
    };

    const updateData = (field: keyof typeof employeeData, value: any) => {
        setEmployeeData(prev => ({ ...prev, [field]: value }));
    };
    
    const handleNext = () => {
        setIsAnimatingOut(true);
        setTimeout(() => {
            setCurrentStep(prev => Math.min(prev + 1, stepsConfig.length - 1));
            setIsAnimatingOut(false);
        }, 400);
    };

    const handleBack = () => {
        setIsAnimatingOut(true);
        setTimeout(() => {
            setCurrentStep(prev => Math.max(prev - 1, 0));
            setIsAnimatingOut(false);
        }, 400);
    };
    
    const handleSubmit = async () => {
        if (isSaving) return;
        setIsSaving(true);
        const finalData: Omit<Employee, 'id'> & { id?: number } = {
            ...employeeData,
            date_of_birth: employeeData.date_of_birth ? new Date(employeeData.date_of_birth + 'T00:00:00.000Z').toISOString() : undefined,
            id: employeeToEdit?.id,
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

    const currentStepContent = () => {
        const stepProps = { data: employeeData, updateData };
        switch (currentStep) {
            case 0: return <BasicInfoStep {...stepProps} />;
            case 1: return <JobInfoStep {...stepProps} />;
            case 2: return <CertificatesStep {...stepProps} />;
            case 3: return <ContactInfoStep {...stepProps} />;
            case 4: return <DocumentsStep {...{...stepProps, isMobile, setScanningDocId, fileInputRef, setActiveDocId}} />;
            default: return null;
        }
    };

    return ReactDOM.createPortal(
        <div className={`fixed inset-0 z-50 bg-gray-50 dark:bg-gray-900 flex flex-col ${isClosing ? 'animate-slide-out-left' : 'animate-slide-in-left'}`} role="dialog" aria-modal="true">
            {/* Header */}
            <header className="p-4 border-b border-gray-200 dark:border-gray-700/50 flex-shrink-0">
                <div className="container mx-auto flex justify-between items-center">
                    <h2 className="text-xl font-bold text-primary dark:text-white">{employeeToEdit ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد'}</h2>
                    <button onClick={handleClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"><CloseIcon className="w-6 h-6"/></button>
                </div>
                <div className="container mx-auto mt-4">
                    <div className="flex items-center justify-between">
                        {stepsConfig.map((step, index) => {
                            const isActive = index === currentStep;
                            const isCompleted = index < currentStep;
                            return (
                                <React.Fragment key={step.id}>
                                    <div className="flex flex-col items-center text-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-primary text-white scale-110' : isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                                            {isCompleted ? <CheckIcon className="w-6 h-6"/> : step.icon}
                                        </div>
                                        <p className={`mt-2 text-xs font-bold transition-colors ${isActive || isCompleted ? 'text-primary dark:text-primary-light' : 'text-gray-500 dark:text-gray-400'}`}>{step.title}</p>
                                    </div>
                                    {index < stepsConfig.length - 1 && <div className="flex-1 h-0.5 bg-gray-200 dark:bg-gray-700 mx-2"></div>}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="flex-grow overflow-y-auto">
                <div className="container mx-auto p-4 md:p-8">
                     <div className={isAnimatingOut ? 'animate-stepper-content-out' : 'animate-stepper-content-in'}>
                         {currentStepContent()}
                    </div>
                </div>
            </main>
            
            {/* Navigation */}
            <footer className="p-4 border-t border-gray-200 dark:border-gray-700/50 bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 flex-shrink-0">
                <div className="container mx-auto flex justify-between items-center">
                    <button onClick={handleBack} disabled={currentStep === 0 || isSaving} className="btn btn-secondary gap-2 disabled:opacity-50">
                        <ArrowBackIcon className="w-5 h-5" /> <span>رجوع</span>
                    </button>
                    {currentStep < stepsConfig.length - 1 ? (
                        <button onClick={handleNext} disabled={isSaving} className="btn btn-primary gap-2">
                            <span>التالي</span> <ArrowRightIcon className="w-5 h-5" />
                        </button>
                    ) : (
                         <button onClick={handleSubmit} disabled={isSaving} className="btn btn-primary disabled:opacity-70 disabled:cursor-wait">
                            {isSaving ? 'جاري الحفظ...' : 'حفظ'}
                        </button>
                    )}
                </div>
            </footer>
             <ScanDocumentModal isOpen={scanningDocId !== null} onClose={() => setScanningDocId(null)} onScanComplete={(file) => {
                if (scanningDocId) {
                    updateData('documents', employeeData.documents.map(d => d.id === scanningDocId ? { ...d, file: file || undefined, display_file_name: file ? file.name : d.display_file_name } : d));
                    addToast('تم المسح بنجاح!', 'تم إرفاق المستند وجاهز للحفظ.', 'scan_success');
                }
                setScanningDocId(null);
                setActiveDocId(null);
            }}/>
        </div>,
        modalRoot
    );
};

// --- Step Components ---
const StepWrapper: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="max-w-4xl mx-auto">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">{title}</h3>
        <div className="space-y-4">{children}</div>
    </div>
);

const BasicInfoStep: React.FC<{ data: typeof initialEmployeeState; updateData: Function }> = ({ data, updateData }) => {
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => setFocusedField(e.target.name);
    const handleBlur = () => setFocusedField(null);

    const genderIcon = focusedField === 'gender' 
        ? <UsersIcon className="w-5 h-5 text-accent" /> 
        : <UsersIcon className="w-5 h-5" />;

    return (
        <StepWrapper title="المعلومات الأساسية">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput label="الاسم باللغة العربية" name="full_name_ar" value={data.full_name_ar} onChange={(e) => updateData(e.target.name, e.target.value)} required icon={<UserIcon className="w-5 h-5" />} onFocus={handleFocus} onBlur={handleBlur} />
                <FormInput label="الاسم باللغة الإنجليزية" name="full_name_en" value={data.full_name_en} onChange={(e) => updateData(e.target.name, e.target.value)} icon={<UserIcon className="w-5 h-5" />} onFocus={handleFocus} onBlur={handleBlur} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormInput label="السجل المدني / الإقامة" name="national_id" value={data.national_id || ''} onChange={(e) => updateData(e.target.name, e.target.value)} icon={<IdentificationIcon className="w-5 h-5" />} onFocus={handleFocus} onBlur={handleBlur} />
                <FormInput label="الجنسية" name="nationality" value={data.nationality || ''} onChange={(e) => updateData(e.target.name, e.target.value)} icon={<GlobeAltIcon className="w-5 h-5" />} onFocus={handleFocus} onBlur={handleBlur} />
                <FormSelect label="الجنس" name="gender" value={data.gender} onChange={(e) => updateData(e.target.name, e.target.value)} icon={genderIcon} onFocus={handleFocus} onBlur={handleBlur}>
                    <option value="">اختر الجنس</option>
                    <option value="ذكر">ذكر</option>
                    <option value="أنثى">أنثى</option>
                </FormSelect>
            </div>
            <FormInput label="تاريخ الميلاد" name="date_of_birth" type="date" value={data.date_of_birth} onChange={(e) => updateData(e.target.name, e.target.value)} icon={<CakeIcon className="w-5 h-5" />} onFocus={handleFocus} onBlur={handleBlur} />
        </StepWrapper>
    );
};

const JobInfoStep: React.FC<{ data: typeof initialEmployeeState; updateData: Function }> = ({ data, updateData }) => (
    <StepWrapper title="البيانات الوظيفية">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput label="الرقم الوظيفي" name="employee_id" value={data.employee_id} onChange={(e) => updateData(e.target.name, e.target.value)} icon={<IdentificationIcon className="w-5 h-5" />} />
            <FormInput label="المسمى الوظيفي" name="job_title" value={data.job_title} onChange={(e) => updateData(e.target.name, e.target.value)} icon={<BriefcaseIcon className="w-5 h-5" />} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput label="القطاع" name="department" value={data.department} onChange={(e) => updateData(e.target.name, e.target.value)} disabled icon={<BuildingOfficeIcon className="w-5 h-5" />} />
            <FormInput label="المركز" name="center" value={data.center || ''} onChange={(e) => updateData(e.target.name, e.target.value)} icon={<BuildingOfficeIcon className="w-5 h-5" />} />
        </div>
        <FormInput label="رقم التصنيف" name="classification_id" value={data.classification_id || ''} onChange={(e) => updateData(e.target.name, e.target.value)} icon={<DocumentCheckIcon className="w-5 h-5" />} />
    </StepWrapper>
);

const CertificatesStep: React.FC<{ data: typeof initialEmployeeState; updateData: Function }> = ({ data, updateData }) => (
    <StepWrapper title="المؤهلات والشهادات">
        <div className="space-y-4">
            {data.certificates.map((cert, index) => (
                <div key={cert.id} className="p-4 rounded-lg bg-gray-100 dark:bg-gray-700/50 border dark:border-gray-600">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400 dark:text-gray-500"><AcademicCapIcon className="w-5 h-5"/></div>
                            <select value={cert.type} onChange={(e) => updateData('certificates', data.certificates.map((c, i) => i === index ? { ...c, type: e.target.value as CertificateType, custom_name: e.target.value !== 'Other' ? '' : c.custom_name } : c))} className="w-full appearance-none pr-12 pl-4 py-3 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-500"><option disabled>اختر النوع</option>{CertificateTypes.map(t => <option key={t} value={t}>{t}</option>)}</select>
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><ChevronDownIcon className="w-5 h-5 text-gray-400" /></div>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400 dark:text-gray-500"><CalendarDaysIcon className="w-5 h-5"/></div>
                            <input type="date" placeholder="تاريخ الانتهاء" value={cert.expiry_date || ''} onChange={(e) => updateData('certificates', data.certificates.map((c, i) => i === index ? { ...c, expiry_date: e.target.value } : c))} className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-500" />
                        </div>
                        {cert.type === 'Other' && <div className="sm:col-span-2"><FormInput label="اسم الشهادة" value={cert.custom_name || ''} onChange={(e) => updateData('certificates', data.certificates.map((c, i) => i === index ? { ...c, custom_name: e.target.value } : c))} required icon={<PencilIcon className="w-5 h-5"/>} /></div>}
                        <div className="sm:col-span-2"><input type="file" onChange={(e) => updateData('certificates', data.certificates.map((c, i) => i === index ? { ...c, file: e.target.files?.[0], display_file_name: e.target.files?.[0]?.name } : c))} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" /></div>
                    </div>
                    <button type="button" onClick={() => updateData('certificates', data.certificates.filter((_, i) => i !== index))} className="mt-2 text-danger text-sm font-semibold"><TrashIcon className="w-4 h-4 inline-block ml-1"/>إزالة</button>
                </div>
            ))}
        </div>
        <button type="button" onClick={() => updateData('certificates', [...data.certificates, { id: crypto.randomUUID(), type: 'BLS' }])} className="mt-4 flex items-center gap-2 font-semibold py-2 px-4 rounded-lg bg-primary/10 text-primary hover:bg-primary/20"><PlusIcon className="w-5 h-5"/>إضافة شهادة</button>
    </StepWrapper>
);

const ContactInfoStep: React.FC<{ data: typeof initialEmployeeState; updateData: Function }> = ({ data, updateData }) => (
    <StepWrapper title="بيانات التواصل">
        <FormInput label="رقم الجوال" name="phone_direct" type="tel" value={data.phone_direct} onChange={(e) => updateData(e.target.name, e.target.value)} icon={<PhoneIcon className="w-5 h-5"/>} />
        <FormInput label="البريد الإلكتروني" name="email" type="email" value={data.email} onChange={(e) => updateData(e.target.name, e.target.value)} icon={<EmailIcon className="w-5 h-5"/>} />
    </StepWrapper>
);

const DocumentsStep: React.FC<{ data: typeof initialEmployeeState; updateData: Function; isMobile: boolean; setScanningDocId: Function; fileInputRef: React.RefObject<HTMLInputElement>, setActiveDocId: Function }> = ({ data, updateData, isMobile, setScanningDocId, fileInputRef, setActiveDocId }) => (
    <StepWrapper title="ملفات الموظف">
        <input type="file" ref={fileInputRef} onChange={(e) => {
            const activeId = (fileInputRef.current as any)._activeDocId;
            if(activeId) {
                const file = e.target.files?.[0];
                updateData('documents', data.documents.map(d => d.id === activeId ? { ...d, file: file, display_file_name: file?.name } : d));
            }
            if(e.target) e.target.value = '';
        }} className="hidden" accept="image/jpeg,image/png,application/pdf,.doc,.docx" />
        <div className="space-y-4">
            {data.documents.map((doc, index) => (
                <div key={doc.id} className="p-4 rounded-lg bg-gray-100 dark:bg-gray-700/50 border dark:border-gray-600">
                    <FormInput label="اسم الملف" value={doc.name || ''} onChange={(e) => updateData('documents', data.documents.map((d, i) => i === index ? { ...d, name: e.target.value } : d))} required icon={<DocumentTextIcon className="w-5 h-5"/>}/>
                    <div className="mt-2">
                        <button type="button" onClick={() => {
                            if (isMobile) {
                                setScanningDocId(doc.id);
                            } else {
                                (fileInputRef.current as any)._activeDocId = doc.id;
                                fileInputRef.current?.click();
                            }
                        }} className="flex items-center gap-2 font-semibold py-2 px-4 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-500">
                            {isMobile ? <CameraIcon className="w-5 h-5"/> : <CloudArrowUpIcon className="w-5 h-5"/>} {isMobile ? 'مسح مستند' : 'رفع ملف'}
                        </button>
                         <p className="text-sm text-gray-500 mt-2 truncate">{doc.file?.name || doc.display_file_name || 'لم يتم اختيار ملف'}</p>
                    </div>
                    <button type="button" onClick={() => updateData('documents', data.documents.filter((_, i) => i !== index))} className="mt-2 text-danger text-sm font-semibold"><TrashIcon className="w-4 h-4 inline-block ml-1"/>إزالة</button>
                </div>
            ))}
        </div>
        <button type="button" onClick={() => updateData('documents', [...data.documents, { id: crypto.randomUUID(), name: '' }])} className="mt-4 flex items-center gap-2 font-semibold py-2 px-4 rounded-lg bg-primary/10 text-primary hover:bg-primary/20"><PlusIcon className="w-5 h-5"/>إضافة ملف</button>
    </StepWrapper>
);

export default AddEmployeeOnboarding;