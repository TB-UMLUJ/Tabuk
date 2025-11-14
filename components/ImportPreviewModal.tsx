


import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { ImportSummary, ValidationIssue, UpdatePreview, UpdateSelection, Employee, OfficeContact } from '../types';
import { 
    CloseIcon, 
    UserPlusIcon, 
    PencilIcon, 
    ExclamationTriangleIcon,
    XCircleIcon,
    InformationCircleIcon,
    ClipboardDocumentListIcon,
    UserIcon,
    PhoneIcon
} from '../icons/Icons';

type DataType = 'employees' | 'contacts';

interface ImportPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (selections: UpdateSelection) => void;
    summary: ImportSummary;
    data: { toCreate: (Omit<Employee, 'id'> | Omit<OfficeContact, 'id'>)[]; toUpdate: UpdatePreview<Employee | OfficeContact>[] };
    validationIssues: ValidationIssue[];
    isProcessing: boolean;
    dataType: DataType;
}

const fieldLabels: Record<string, string> = {
    employee_id: 'الرقم الوظيفي',
    full_name_ar: 'الاسم بالعربية',
    full_name_en: 'الاسم بالإنجليزية',
    job_title: 'المسمى الوظيفي',
    department: 'القطاع',
    center: 'المركز',
    phone_direct: 'رقم الجوال',
    email: 'البريد الإلكتروني',
    national_id: 'السجل المدني / الإقامة',
    nationality: 'الجنسية',
    gender: 'الجنس',
    date_of_birth: 'تاريخ الميلاد',
    classification_id: 'رقم التصنيف',
    name: 'اسم المكتب',
    extension: 'التحويلة',
    location: 'الموقع'
};

const getIdentifier = (item: any, dataType: DataType): string | number => {
    return dataType === 'employees' ? item.employee_id : item.name;
};

const normalize = (val: any): string | null => {
    if (val === null || val === undefined || String(val).trim() === '') return null;
    return String(val).trim();
};

const UpdateCard: React.FC<{
    item: UpdatePreview<Employee | OfficeContact>;
    dataType: DataType;
    selectedFields: Set<string>;
    onSelectionChange: (newSelection: Set<string>) => void;
}> = ({ item, dataType, selectedFields, onSelectionChange }) => {
    
    const allFields = useMemo(() => Array.from(new Set([...Object.keys(item.old), ...Object.keys(item.new)])), [item.old, item.new]);
    
    const allChangedFields = useMemo(() => allFields.filter(key => {
        if (['id', 'created_at', 'updated_at', 'department'].includes(key)) return false;
        return normalize((item.old as Record<string, any>)[key]) !== normalize((item.new as Record<string, any>)[key]);
    }), [allFields, item.old, item.new]);

    const handleFieldToggle = (field: string) => {
        const newSelection = new Set(selectedFields);
        if (newSelection.has(field)) {
            newSelection.delete(field);
        } else {
            newSelection.add(field);
        }
        onSelectionChange(newSelection);
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            onSelectionChange(new Set(allChangedFields));
        } else {
            onSelectionChange(new Set());
        }
    };
    
    const isAllSelected = allChangedFields.length > 0 && allChangedFields.every(field => selectedFields.has(field));
    const displayName = dataType === 'employees' ? (item.old as Employee).full_name_ar : (item.old as OfficeContact).name;
    const identifier = dataType === 'employees' ? (item.old as Employee).employee_id : (item.old as OfficeContact).name;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mb-4 overflow-hidden">
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 flex justify-between items-center">
                <div>
                    <p className="font-bold text-primary dark:text-primary-light">{displayName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{dataType === 'employees' ? 'رقم وظيفي' : 'اسم المكتب'}: {identifier}</p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-600 dark:text-gray-300">
                    <input type="checkbox" checked={isAllSelected} onChange={handleSelectAll} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                    تحديد الكل
                </label>
            </div>
            <div className="p-4 text-sm">
                <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-x-4 gap-y-2 items-center">
                    <div className="font-bold text-gray-500 dark:text-gray-400">الحقل</div>
                    <div className="font-bold text-gray-500 dark:text-gray-400">القيمة الحالية</div>
                    <div className="font-bold text-gray-500 dark:text-gray-400">القيمة الجديدة</div>
                    <div></div>
                    
                    {allFields.map(field => {
                        if (['id', 'created_at', 'updated_at', 'department'].includes(field)) return null;

                        const oldValue = normalize((item.old as Record<string, any>)[field]);
                        const newValue = normalize((item.new as Record<string, any>)[field]);
                        const isChanged = oldValue !== newValue;
                        const willClearData = isChanged && oldValue !== null && newValue === null;

                        return (
                             <React.Fragment key={field}>
                                <div className={`font-semibold py-2 ${isChanged ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'}`}>{fieldLabels[field as keyof typeof fieldLabels] || field}</div>
                                <div className={`py-2 truncate ${isChanged ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'}`} title={oldValue || undefined}>{oldValue || '-'}</div>
                                <div className={`py-2 truncate flex items-center gap-2 ${isChanged ? 'bg-yellow-50 dark:bg-yellow-900/30 rounded px-2' : ''}`} title={newValue || undefined}>
                                    {/* FIX: Moved title prop to a wrapping span to fix TypeScript error. */}
                                    {willClearData && <span title="سيؤدي هذا إلى مسح البيانات الموجودة"><ExclamationTriangleIcon className="w-4 h-4 text-amber-500 flex-shrink-0" /></span>}
                                    <span className={willClearData ? 'italic text-gray-500' : ''}>{newValue || '-'}</span>
                                </div>
                                <div className="py-2 flex justify-center">
                                    {isChanged && (
                                        <input type="checkbox" checked={selectedFields.has(field)} onChange={() => handleFieldToggle(field)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                                    )}
                                </div>
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};


const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number; colorClass: string }> = ({ icon, label, value, colorClass }) => (
    <div className={`p-4 rounded-lg flex items-center gap-3 ${colorClass}`}>
        <div className="flex-shrink-0">{icon}</div>
        <div>
            <p className="font-bold text-2xl">{value}</p>
            <p className="text-sm font-semibold">{label}</p>
        </div>
    </div>
);

const ImportPreviewModal: React.FC<ImportPreviewModalProps> = ({ isOpen, onClose, onConfirm, summary, data, validationIssues, isProcessing, dataType }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [activeTab, setActiveTab] = useState<'summary' | 'updates' | 'warnings'>('summary');
    const [updateSelections, setUpdateSelections] = useState<UpdateSelection>({});
    const dataTypeText = dataType === 'employees' ? 'الموظفين' : 'جهات الاتصال';

    useEffect(() => {
        if (isOpen) {
            const initialSelections: UpdateSelection = {};
            data.toUpdate.forEach(item => {
                const id = getIdentifier(item.old, dataType);
                const changedFields = Object.keys(item.new).filter(key => {
                    const oldValue = normalize((item.old as any)[key]);
                    const newValue = normalize((item.new as any)[key]);
                    const isNewValueEmpty = newValue === null;

                    // Only pre-select if the values are different AND the new value is not empty.
                    // This prevents accidentally clearing data by default.
                    return oldValue !== newValue && !isNewValueEmpty;
                });
                initialSelections[id] = new Set(changedFields);
            });
            setUpdateSelections(initialSelections);
            setActiveTab('summary');
        }
    }, [isOpen, data.toUpdate, dataType]);

    const handleSelectionChange = (id: string | number, newSelectedFields: Set<string>) => {
        setUpdateSelections(prev => ({ ...prev, [id]: newSelectedFields }));
    };

    const handleClose = () => {
        if (isProcessing) return;
        setIsClosing(true);
        setTimeout(() => { onClose(); setIsClosing(false); }, 300);
    };

    if (!isOpen) return null;
    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;

    const tabs = [
        { id: 'summary', label: 'الملخص' },
        { id: 'updates', label: `للتحديث (${summary.update})`, disabled: summary.update === 0 },
        { id: 'warnings', label: `تنبيهات (${validationIssues.length})`, disabled: validationIssues.length === 0 },
    ];

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[60] flex justify-center items-center p-4" role="dialog" aria-modal="true">
            <div className={`fixed inset-0 bg-black/60 ${isClosing ? 'animate-backdrop-out' : 'animate-backdrop-in'}`} onClick={handleClose} aria-hidden="true" />
            <div className={`relative bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col transform ${isClosing ? 'animate-modal-out' : 'animate-modal-in'} dark:bg-gray-800`}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <button onClick={handleClose} className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">مراجعة استيراد {dataTypeText}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">يرجى مراجعة التغييرات قبل تأكيد الاستيراد.</p>
                </div>
                
                <div className="border-b border-gray-200 dark:border-gray-700 px-6">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        {tabs.map(tab => (
                            <button key={tab.id} onClick={() => !tab.disabled && setActiveTab(tab.id as any)} disabled={tab.disabled}
                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm ${activeTab === tab.id ? 'border-primary text-primary dark:border-primary-light dark:text-primary-light' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} disabled:opacity-50 disabled:cursor-not-allowed`}>
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 p-6 overflow-y-auto flex-grow">
                    {activeTab === 'summary' && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <StatCard icon={<UserPlusIcon className="w-7 h-7" />} label="سجلات جديدة" value={summary.create} colorClass="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300" />
                            <StatCard icon={<PencilIcon className="w-7 h-7" />} label="سجلات ستُحدّث" value={summary.update} colorClass="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300" />
                            <StatCard icon={<XCircleIcon className="w-7 h-7" />} label="سجلات متطابقة" value={summary.ignored} colorClass="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300" />
                        </div>
                    )}
                    {activeTab === 'updates' && (
                        <div>
                            {data.toUpdate.map(item => (
                                <UpdateCard
                                    key={getIdentifier(item.old, dataType)}
                                    item={item}
                                    dataType={dataType}
                                    selectedFields={updateSelections[getIdentifier(item.old, dataType)] || new Set()}
                                    onSelectionChange={(newSelection) => handleSelectionChange(getIdentifier(item.old, dataType), newSelection)}
                                />
                            ))}
                        </div>
                    )}
                     {activeTab === 'warnings' && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg max-h-96 overflow-y-auto border border-amber-200 dark:border-amber-800">
                            <ul className="space-y-2">
                                {validationIssues.map((issue, index) => (
                                    <li key={index} className="text-sm text-amber-900 dark:text-amber-200">
                                        - في الصف <strong>{issue.rowIndex}</strong>: {issue.message}
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-4 p-2 rounded-md bg-blue-100/50 dark:bg-blue-900/30 flex items-start gap-2 text-xs text-blue-800 dark:text-blue-300">
                                <InformationCircleIcon className="w-4 h-4 mt-0.5 flex-shrink-0"/>
                                <span>سيتم استيراد الصفوف التي بها تنبيهات. يمكنك تعديل بياناتها لاحقًا من داخل التطبيق.</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 flex-shrink-0">
                    <button onClick={handleClose} disabled={isProcessing} className="btn btn-secondary disabled:opacity-50">
                        إلغاء
                    </button>
                    <button onClick={() => onConfirm(updateSelections)} disabled={isProcessing} className="btn btn-primary disabled:opacity-50 disabled:cursor-wait">
                        {isProcessing ? 'جاري المعالجة...' : 'تأكيد'}
                    </button>
                </div>
            </div>
        </div>,
        modalRoot
    );
};

export default ImportPreviewModal;
