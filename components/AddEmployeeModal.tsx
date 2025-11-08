

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Employee } from '../types';
import { CloseIcon, UserPlusIcon } from '../icons/Icons';

interface AddEmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (employee: Omit<Employee, 'id'> & { id?: number }) => void;
    employeeToEdit: Employee | null;
}

const initialEmployeeState: Omit<Employee, 'id' | 'date_of_birth'> & { date_of_birth: string } = {
    full_name_ar: '',
    full_name_en: '',
    employee_id: '',
    job_title: '',
    department: '',
    phone_direct: '',
    email: '',
    center: '',
    national_id: '',
    nationality: '',
    gender: '',
    date_of_birth: '',
    classification_id: '',
};

// Define FormInput component outside of the main component to prevent re-creation on re-renders
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            {...props}
        />
    </div>
);

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ isOpen, onClose, onSave, employeeToEdit }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [employeeData, setEmployeeData] = useState(initialEmployeeState);
    const [emailError, setEmailError] = useState('');

    const validateEmail = (email: string): string => {
        if (!email) return ''; // Optional field, so empty is valid
        const emailRegex = /^[^\s@]+@moh\.gov\.sa$/i;
        if (!emailRegex.test(email.toLowerCase())) {
            return 'يجب أن يكون البريد الإلكتروني صالحًا وينتهي بـ @moh.gov.sa';
        }
        return '';
    };

    // Effect to populate form data based on employeeToEdit prop
    useEffect(() => {
        if (employeeToEdit) {
            // Edit mode: populate form
            setEmployeeData({
                ...initialEmployeeState,
                ...employeeToEdit,
                date_of_birth: employeeToEdit.date_of_birth ? new Date(employeeToEdit.date_of_birth).toISOString().split('T')[0] : '',
            });
            setEmailError(validateEmail(employeeToEdit.email || ''));
        } else {
            // Add mode: ensure form is reset
            setEmployeeData(initialEmployeeState);
            setEmailError('');
        }
    }, [employeeToEdit]);

    // Effect to handle body scroll based on modal visibility
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'email') {
            setEmailError(validateEmail(value));
        }
        setEmployeeData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const currentEmailError = validateEmail(employeeData.email);
        if (currentEmailError) {
            setEmailError(currentEmailError);
            return;
        }

        const dataToSave = { ...employeeData };

        // Trim all string values before saving
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
            // Ensure optional fields are undefined if empty
            center: dataToSave.center || undefined,
            national_id: dataToSave.national_id || undefined,
            nationality: dataToSave.nationality || undefined,
            gender: dataToSave.gender || undefined,
            classification_id: dataToSave.classification_id || undefined,
        };
        onSave(finalData);
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
            <div className={`relative bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto transform ${isClosing ? 'animate-modal-out' : 'animate-modal-in'} dark:bg-gray-800`}>
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
                        <div className="space-y-4">
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormInput label="الاسم باللغة العربية" name="full_name_ar" required value={employeeData.full_name_ar} onChange={handleChange} />
                                <FormInput label="الاسم باللغة الإنجليزية" name="full_name_en" value={employeeData.full_name_en} onChange={handleChange} />
                                <FormInput label="الرقم الوظيفي" name="employee_id" required value={employeeData.employee_id} onChange={handleChange} />
                                <FormInput label="المسمى الوظيفي" name="job_title" required value={employeeData.job_title} onChange={handleChange} />
                                <FormInput label="القطاع" name="department" required value={employeeData.department} onChange={handleChange} />
                                <FormInput label="المركز" name="center" value={employeeData.center || ''} onChange={handleChange} />
                            </div>

                            <hr className="my-4 dark:border-gray-700" />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormInput label="رقم الجوال" name="phone_direct" type="tel" value={employeeData.phone_direct} onChange={handleChange} />
                                <div>
                                    <FormInput label="البريد الإلكتروني" name="email" type="email" value={employeeData.email} onChange={handleChange} />
                                    {emailError && <p className="text-danger text-xs mt-1">{emailError}</p>}
                                </div>
                            </div>

                            <hr className="my-4 dark:border-gray-700" />

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <FormInput label="السجل المدني / الإقامة" name="national_id" value={employeeData.national_id || ''} onChange={handleChange} />
                                <FormInput label="الجنسية" name="nationality" value={employeeData.nationality || ''} onChange={handleChange} />
                                <div>
                                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        الجنس
                                    </label>
                                    <select
                                        id="gender"
                                        name="gender"
                                        value={employeeData.gender}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    >
                                        <option value="">اختر الجنس</option>
                                        <option value="ذكر">ذكر</option>
                                        <option value="أنثى">أنثى</option>
                                    </select>
                                </div>
                                <FormInput label="تاريخ الميلاد" name="date_of_birth" type="date" value={employeeData.date_of_birth} onChange={handleChange} />
                                <FormInput label="رقم التصنيف" name="classification_id" value={employeeData.classification_id || ''} onChange={handleChange} />
                            </div>
                        </div>
                        
                        <div className="mt-8 flex justify-end gap-3">
                            <button type="button" onClick={handleClose} className="bg-gray-200 text-gray-800 font-semibold py-2 px-6 rounded-lg hover:bg-gray-300 transition-all duration-200 transform hover:-translate-y-0.5 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
                                إلغاء
                            </button>
                            <button 
                                type="submit" 
                                disabled={!!emailError}
                                className="bg-primary text-white font-semibold py-2 px-6 rounded-lg hover:bg-primary-dark transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isEditMode ? 'حفظ التغييرات' : 'حفظ الموظف'}
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