

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { supabase } from './lib/supabaseClient';
import { PostgrestError } from '@supabase/supabase-js';
import { Employee, OfficeContact, Task, Transaction, User, TransactionStatus, ImportSummary, ValidationIssue, UpdatePreview, UpdateSelection, Certificate } from './types';
import Header from './components/Header';
import SearchAndFilter, { SearchAndFilterRef } from './components/SearchAndFilter';
import EmployeeList from './components/EmployeeList';
import EmployeeProfileModal from './components/EmployeeProfileModal';
import LoginScreen from './components/LoginScreen';
import WelcomeScreen from './components/WelcomeScreen';
import { useToast } from './contexts/ToastContext';
import Tabs from './components/Tabs';
import OrganizationalChartView from './components/OrganizationalChartView';
import AddEmployeeModal from './components/AddEmployeeModal';
import ImportProgressModal from './components/ImportProgressModal';
import BottomNavBar from './components/BottomNavBar';
import OfficeDirectory from './components/OfficeDirectory';
import AddOfficeContactModal from './components/AddOfficeContactModal';
import TasksView from './components/TasksView';
import AddTaskModal from './components/AddTaskModal';
import TransactionsView from './components/TransactionsView';
import AddTransactionModal from './components/AddTransactionModal';
import TransactionDetailModal from './components/TransactionDetailModal';
import ConfirmationModal from './components/ConfirmationModal';
import { mockTasks } from './data/mockTasks';
import { mockTransactions } from './data/mockTransactions';
import SettingsScreen from './components/SettingsScreen';
import StatisticsView from './components/StatisticsView';
import { useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';
import TaskDetailModal from './components/TaskDetailModal';
import { logActivity } from './lib/activityLogger';
import SkeletonLoader from './components/SkeletonLoader';
import SortModal, { SortConfig } from './components/SortModal';
import GlobalSearch from './components/GlobalSearch';
import ImportPreviewModal from './components/ImportPreviewModal';


declare const XLSX: any;

const App: React.FC = () => {
    const { addToast } = useToast();
    const { currentUser, isAuthenticating, justLoggedIn, clearJustLoggedIn } = useAuth();
    const { logos } = useTheme();
    const [showSettings, setShowSettings] = useState(false);
    
    // Data State
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [officeContacts, setOfficeContacts] = useState<OfficeContact[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    // UI & Filter State
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'full_name_ar', direction: 'asc' });
    const [activeFilters, setActiveFilters] = useState<{ center: string; jobTitle: string }>({ center: 'all', jobTitle: 'all' });
    const [activeTab, setActiveTab] = useState<'directory' | 'orgChart' | 'officeDirectory' | 'tasks' | 'transactions' | 'statistics'>('statistics');
    const [importProgress, setImportProgress] = useState<{
        isOpen: boolean;
        fileName: string;
        fileSize: number;
        progress: number;
    }>({ isOpen: false, fileName: '', fileSize: 0, progress: 0 });
    const [visibleEmployeeCount, setVisibleEmployeeCount] = useState(20);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    
    // Modal State
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
    const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
    const [contactToEdit, setContactToEdit] = useState<OfficeContact | null>(null);
    const [showAddOfficeContactModal, setShowAddOfficeContactModal] = useState(false);
    const [showAddTaskModal, setShowAddTaskModal] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
    const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);
    const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [showSortModal, setShowSortModal] = useState(false);
    const [isGlobalSearchOpen, setGlobalSearchOpen] = useState(false);
    const [confirmation, setConfirmation] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
    });
    
    const [importPreview, setImportPreview] = useState<{
        summary: ImportSummary;
        data: { toCreate: (Omit<Employee, 'id'> | Omit<OfficeContact, 'id'>)[]; toUpdate: UpdatePreview<Employee | OfficeContact>[] };
        validationIssues: ValidationIssue[];
        dataType: 'employees' | 'contacts';
        fileInfo: { name: string; size: number };
    } | null>(null);
    
    const genericFileInputRef = useRef<HTMLInputElement>(null);
    const [importHandler, setImportHandler] = useState<(file: File) => void>(() => () => {});


    const requestConfirmation = (title: string, message: string, onConfirm: () => void) => {
        setConfirmation({ isOpen: true, title, message, onConfirm });
    };

    const closeConfirmation = () => {
        setConfirmation({ isOpen: false, title: '', message: '', onConfirm: () => {} });
    };


    // --- Data Fetching and Seeding from Supabase ---
    useEffect(() => {
        const fetchDataAndSeed = async () => {
            setLoading(true);
            try {
                // Seed data if tables are empty
                const { count: tasksCount, error: tasksCountError } = await supabase.from('tasks').select('*', { count: 'exact', head: true });
                if (tasksCountError) throw tasksCountError;

                if (tasksCount === 0) {
                    const tasksToInsert = mockTasks.map(({ id, ...rest }) => rest);
                    const { error: insertError } = await supabase.from('tasks').insert(tasksToInsert);
                    if (insertError) throw insertError;
                }

                const { count: transactionsCount, error: transactionsCountError } = await supabase.from('transactions').select('*', { count: 'exact', head: true });
                if (transactionsCountError) throw transactionsCountError;
                
                if (transactionsCount === 0) {
                    const transactionsToInsert = mockTransactions.map(({ id, ...rest }) => rest);
                    const { error: insertError } = await supabase.from('transactions').insert(transactionsToInsert);
                    if (insertError) throw insertError;
                }

                // Fetch all data
                const [
                    { data: employeesData, error: employeesError },
                    { data: contactsData, error: contactsError },
                    { data: tasksData, error: tasksError },
                    { data: transactionsData, error: transactionsError },
                ] = await Promise.all([
                    supabase.from('employees').select('*').order('full_name_ar', { ascending: true }),
                    supabase.from('office_contacts').select('*').order('name', { ascending: true }),
                    supabase.from('tasks').select('*').order('due_date', { ascending: true, nullsFirst: false }),
                    supabase.from('transactions').select('*, linked_employee:employees(id, full_name_ar), linked_office_contact:office_contacts(id, name)').order('date', { ascending: false }),
                ]);

                if (employeesError) throw employeesError;
                if (contactsError) throw contactsError;
                if (tasksError) throw tasksError;
                if (transactionsError) throw transactionsError;

                setEmployees(employeesData || []);
                setOfficeContacts(contactsData || []);
                setTasks(tasksData || []);
                setTransactions(transactionsData || []);

            } catch (error: any) {
                console.error("Error fetching or seeding data:", error);
                let errorMessage = "فشل الاتصال بالخادم. يرجى المحاولة مرة أخرى.";

                if (typeof error?.message === 'string') {
                    errorMessage = error.message;
                } else if (typeof error === 'string') {
                    errorMessage = error;
                }
                
                addToast('فشل جلب البيانات', `يرجى التحقق من اتصالك بالشبكة.`, 'error');
            } finally {
                setLoading(false);
            }
        };

        if (currentUser && !justLoggedIn) {
            fetchDataAndSeed();
        }
    }, [currentUser, justLoggedIn, addToast]);

     useEffect(() => {
        if (justLoggedIn) {
            const timer = setTimeout(() => {
                clearJustLoggedIn();
            }, 6000); // Show welcome message for 6 seconds
            return () => clearTimeout(timer);
        }
    }, [justLoggedIn, clearJustLoggedIn]);

    // --- Real-time Subscriptions ---
    useEffect(() => {
        if (!currentUser) return;

        const enrichTransaction = (transaction: Transaction, allEmployees: Employee[], allContacts: OfficeContact[]): Transaction => {
            const emp = transaction.linked_employee_id ? allEmployees.find(e => e.id === transaction.linked_employee_id) : null;
            const contact = transaction.linked_office_contact_id ? allContacts.find(c => c.id === transaction.linked_office_contact_id) : null;
            return {
                ...transaction,
                linked_employee: emp ? { id: emp.id, full_name_ar: emp.full_name_ar } : null,
                linked_office_contact: contact ? { id: contact.id, name: contact.name } : null,
            };
        };

        const employeesSubscription = supabase.channel('employees-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'employees' }, (payload) => {
                if (payload.eventType === 'INSERT') setEmployees(prev => [...prev, payload.new as Employee]);
                if (payload.eventType === 'UPDATE') setEmployees(prev => prev.map(e => e.id === payload.new.id ? payload.new as Employee : e));
                if (payload.eventType === 'DELETE') setEmployees(prev => prev.filter(e => e.id !== (payload.old as any).id));
            }).subscribe();

        const contactsSubscription = supabase.channel('office_contacts-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'office_contacts' }, (payload) => {
                if (payload.eventType === 'INSERT') setOfficeContacts(prev => [...prev, payload.new as OfficeContact]);
                if (payload.eventType === 'UPDATE') setOfficeContacts(prev => prev.map(c => c.id === payload.new.id ? payload.new as OfficeContact : c));
                if (payload.eventType === 'DELETE') setOfficeContacts(prev => prev.filter(c => c.id !== (payload.old as any).id));
            }).subscribe();
        
        const tasksSubscription = supabase.channel('tasks-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setTasks(prev => [...prev, payload.new as Task]);
                    if (Notification.permission === 'granted') {
                        new Notification('مهمة جديدة', { body: `تمت إضافة مهمة: ${payload.new.title}`, icon: logos.mainLogoUrl });
                    }
                }
                if (payload.eventType === 'UPDATE') setTasks(prev => prev.map(t => t.id === payload.new.id ? payload.new as Task : t));
                if (payload.eventType === 'DELETE') setTasks(prev => prev.filter(t => t.id !== (payload.old as any).id));
            }).subscribe();

        const transactionsSubscription = supabase.channel('transactions-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                     setTransactions(prev => [enrichTransaction(payload.new as Transaction, employees, officeContacts), ...prev]);
                     if (Notification.permission === 'granted') {
                        new Notification('معاملة جديدة', { body: `تم تسجيل معاملة: ${payload.new.subject}`, icon: logos.mainLogoUrl });
                    }
                }
                if (payload.eventType === 'UPDATE') {
                    setTransactions(prev => prev.map(t => t.id === payload.new.id ? enrichTransaction(payload.new as Transaction, employees, officeContacts) : t));
                }
                if (payload.eventType === 'DELETE') {
                    setTransactions(prev => prev.filter(t => t.id !== (payload.old as any).id));
                }
            }).subscribe();


        return () => {
            supabase.removeChannel(employeesSubscription);
            supabase.removeChannel(contactsSubscription);
            supabase.removeChannel(tasksSubscription);
            supabase.removeChannel(transactionsSubscription);
        };
    }, [currentUser, employees, officeContacts, logos.mainLogoUrl]);

    const filteredEmployees = useMemo(() => {
        const filtered = employees.filter(employee => {
            const centerMatch = activeFilters.center === 'all' || employee.center === activeFilters.center;
            const jobTitleMatch = activeFilters.jobTitle === 'all' || employee.job_title === activeFilters.jobTitle;
            
            if (!centerMatch || !jobTitleMatch) return false;

            return true;
        });

        return [...filtered].sort((a, b) => {
            const { key, direction } = sortConfig;
            const valA = a[key as keyof Employee] as any;
            const valB = b[key as keyof Employee] as any;

            // Push nulls/undefined to the bottom regardless of direction
            if (valA == null) return 1;
            if (valB == null) return -1;
            
            let comparison = 0;
            if (key === 'updated_at') {
                comparison = new Date(valA).getTime() - new Date(valB).getTime();
            } else if (typeof valA === 'string' && typeof valB === 'string') {
                comparison = valA.localeCompare(valB, 'ar', { numeric: true });
            } else {
                if (valA < valB) comparison = -1;
                if (valA > valB) comparison = 1;
            }
            
            return direction === 'asc' ? comparison : -comparison;
        });
    }, [employees, sortConfig, activeFilters]);

    const visibleEmployees = useMemo(
        () => filteredEmployees.slice(0, visibleEmployeeCount),
        [filteredEmployees, visibleEmployeeCount]
    );

    const hasMoreEmployees = visibleEmployeeCount < filteredEmployees.length;

    const loadMoreEmployees = useCallback(() => {
        if (isLoadingMore) return;
        setIsLoadingMore(true);
        setTimeout(() => {
            setVisibleEmployeeCount(prev => prev + 20);
            setIsLoadingMore(false);
        }, 500);
    }, [isLoadingMore]);


    // --- Handlers ---
    const handleSaveEmployee = async (employeeData: Omit<Employee, 'id'> & { id?: number }) => {
        const isEditing = !!employeeData.id;
        
        try {
            const { certificates, ...restOfEmployeeData } = employeeData;
            
            let processedCertificates: Omit<Certificate, 'file'>[] = [];
            const filesToDelete: string[] = [];
    
            if (isEditing && employeeToEdit?.certificates) {
                const newCertIds = new Set(certificates?.map(c => c.id));
                employeeToEdit.certificates.forEach(oldCert => {
                    if (oldCert.id && !newCertIds.has(oldCert.id) && oldCert.file_name) {
                        filesToDelete.push(oldCert.file_name);
                    }
                });
            }
    
            if (certificates && certificates.length > 0) {
                processedCertificates = await Promise.all(certificates.map(async (cert) => {
                    const { file, ...certData } = cert;
                    if (file instanceof File) {
                        if (isEditing && cert.id && employeeToEdit?.certificates) {
                            const oldCert = employeeToEdit.certificates.find(c => c.id === cert.id);
                            if (oldCert?.file_name) {
                                filesToDelete.push(oldCert.file_name);
                            }
                        }
    
                        const fileExt = file.name.split('.').pop();
                        const randomName = `${crypto.randomUUID()}.${fileExt}`;
                        const filePath = `${currentUser?.user_id || 'public'}/${restOfEmployeeData.employee_id || 'new'}/${randomName}`;
    
                        const { data: uploadData, error: uploadError } = await supabase.storage
                            .from('certificates')
                            .upload(filePath, file);
    
                        if (uploadError) {
                            throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
                        }
    
                        const { data: urlData } = supabase.storage.from('certificates').getPublicUrl(uploadData.path);
    
                        return {
                            ...certData,
                            file_url: urlData.publicUrl,
                            file_name: filePath,
                            display_file_name: file.name,
                        };
                    }
                    return certData;
                }));
            }
    
            if (filesToDelete.length > 0) {
                const { error: deleteError } = await supabase.storage.from('certificates').remove(filesToDelete);
                if (deleteError) {
                    console.error('Failed to delete old certificate files:', deleteError);
                    addToast('فشل حذف المرفقات القديمة', 'قد تبقى بعض الملفات القديمة في المخزن.', 'warning');
                }
            }
    
            const dataWithTimestamp = {
                ...restOfEmployeeData,
                certificates: processedCertificates,
                updated_at: new Date().toISOString()
            };
            
            const { data, error } = await supabase.from('employees').upsert(dataWithTimestamp).select();
    
            if (error) {
                addToast('فشل حفظ الموظف', error.message, 'error');
            } else if (data) {
                const savedEmployee = data[0];
                if (!isEditing) {
                    setEmployees(prev => [...prev, savedEmployee]);
                    logActivity(currentUser, 'CREATE_EMPLOYEE', { employeeId: savedEmployee.id, employeeName: savedEmployee.full_name_ar });
                } else {
                    logActivity(currentUser, 'UPDATE_EMPLOYEE', { employeeId: savedEmployee.id, employeeName: savedEmployee.full_name_ar });
                    setEmployees(prev => prev.map(e => e.id === savedEmployee.id ? savedEmployee : e));
                }
                addToast(`تم ${isEditing ? 'تحديث' : 'إضافة'} الموظف بنجاح`, '', 'success');
                setShowAddEmployeeModal(false);
                setEmployeeToEdit(null);
            }
        } catch(e: any) {
            console.error('Error during employee save process:', e);
            addToast('خطأ فادح', e.message || 'حدث خطأ غير متوقع أثناء حفظ بيانات الموظف.', 'error');
        }
    };

    const handleDeleteEmployee = async (employee: Employee) => {
        requestConfirmation(
            'تأكيد الحذف',
            `هل أنت متأكد من رغبتك في حذف الموظف "${employee.full_name_ar}"؟ سيتم حذف جميع شهاداته المرتبطة. لا يمكن التراجع عن هذا الإجراء.`,
            async () => {
                // First, delete associated certificate files from storage
                if (employee.certificates && employee.certificates.length > 0) {
                    const filePaths = employee.certificates
                        .map(cert => cert.file_name)
                        .filter((fileName): fileName is string => !!fileName);
                    
                    if (filePaths.length > 0) {
                        const { error: storageError } = await supabase.storage.from('certificates').remove(filePaths);
                        if (storageError) {
                            console.error("Error deleting certificate files:", storageError);
                            addToast('فشل حذف المرفقات', 'لم نتمكن من حذف ملفات الشهادات المرتبطة.', 'warning');
                        }
                    }
                }

                // Then, delete the employee record
                const { error } = await supabase.from('employees').delete().eq('id', employee.id);
                if (error) {
                    addToast('فشل حذف الموظف', error.message, 'error');
                } else {
                    logActivity(currentUser, 'DELETE_EMPLOYEE', { employeeId: employee.id, employeeName: employee.full_name_ar });
                    addToast('تم حذف الموظف بنجاح', '', 'deleted');
                }
                setSelectedEmployee(null); // Close profile modal after deletion
            }
        );
    };

    const handleImportEmployees = (file: File) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array', cellDates: true });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: null });

                const parseExcelDate = (excelDate: any): string | undefined => {
                    if (excelDate === null || excelDate === undefined) return undefined;
    
                    let date: Date;
                    let isLikelyUtc = false;
    
                    if (excelDate instanceof Date) {
                        date = excelDate;
                    } else if (typeof excelDate === 'number') {
                        date = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
                        isLikelyUtc = true;
                    } else if (typeof excelDate === 'string') {
                        date = new Date(excelDate);
                        if (/^\d{4}-\d{2}-\d{2}$/.test(excelDate.trim())) {
                             isLikelyUtc = true;
                        }
                    } else {
                        return undefined;
                    }
    
                    if (isNaN(date.getTime())) return undefined;
    
                    const year = isLikelyUtc ? date.getUTCFullYear() : date.getFullYear();
                    const month = isLikelyUtc ? date.getUTCMonth() : date.getMonth();
                    const day = isLikelyUtc ? date.getUTCDate() : date.getDate();
    
                    const finalDate = new Date(Date.UTC(year, month, day));
                    
                    return finalDate.toISOString();
                };

                const newEmployees = json
                    .map((row): Omit<Employee, 'id'> => ({
                        employee_id: String(row['الرقم الوظيفي'] ?? '').trim(),
                        full_name_ar: String(row['الاسم باللغة العربية'] ?? '').trim(),
                        full_name_en: String(row['الاسم باللغة الإنجليزية'] ?? '').trim(),
                        job_title: String(row['المسمى الوظيفي'] ?? '').trim(),
                        department: String(row['القطاع'] ?? '').trim(),
                        center: String(row['المركز'] ?? '').trim(),
                        phone_direct: String(row['رقم الجوال'] ?? '').trim(),
                        email: String(row['البريد الإلكتروني'] ?? '').trim(),
                        national_id: String(row['السجل المدني / الإقامة'] ?? '').trim(),
                        nationality: String(row['الجنسية'] ?? '').trim(),
                        gender: String(row['الجنس'] ?? '').trim(),
                        date_of_birth: parseExcelDate(row['تاريخ الميلاد']),
                        classification_id: String(row['رقم التصنيف'] ?? '').trim(),
                    }));

                const uniqueEmployeesMap = new Map<string, Omit<Employee, 'id'>>();
                newEmployees.forEach(employee => {
                     if (employee.employee_id) {
                       uniqueEmployeesMap.set(employee.employee_id, employee);
                    }
                });
                const uniqueEmployees = Array.from(uniqueEmployeesMap.values());

                if (uniqueEmployees.length === 0) {
                    addToast('لا توجد بيانات صالحة', 'لم يتم العثور على موظفين في الملف أو أن عمود الرقم الوظيفي فارغ.', 'warning');
                    return;
                }

                const excelEmployeeIds = uniqueEmployees.map(emp => emp.employee_id);
                const { data: existingEmployeesData, error: fetchError } = await supabase
                    .from('employees')
                    .select('*')
                    .in('employee_id', excelEmployeeIds);

                if (fetchError) throw fetchError;

                const existingEmployeesMap = new Map<string, Employee>();
                existingEmployeesData.forEach(e => {
                    if (e.employee_id) {
                        existingEmployeesMap.set(e.employee_id.trim(), e);
                    }
                });

                const recordsToCreate: Omit<Employee, 'id'>[] = [];
                const recordsToUpdate: UpdatePreview<Employee>[] = [];
                let ignoredCount = 0;
                const validationIssues: ValidationIssue[] = [];

                const areEmployeesEqual = (excelEmp: Omit<Employee, 'id'>, dbEmp: Employee): boolean => {
                    const normalize = (val: any) => {
                        if (val === null || val === undefined || String(val).trim() === '') return null;
                        return String(val).trim();
                    };
                    const getComparableDate = (dateStr: string | undefined) => {
                        if (!dateStr) return null;
                        try {
                            const date = new Date(dateStr);
                            if (isNaN(date.getTime())) return null;
                            return date.toISOString().split('T')[0];
                        } catch (e) {
                            return null;
                        }
                    };
                    return normalize(excelEmp.employee_id) === normalize(dbEmp.employee_id) &&
                           normalize(excelEmp.full_name_ar) === normalize(dbEmp.full_name_ar) &&
                           normalize(excelEmp.full_name_en) === normalize(dbEmp.full_name_en) &&
                           normalize(excelEmp.job_title) === normalize(dbEmp.job_title) &&
                           normalize(excelEmp.department) === normalize(dbEmp.department) &&
                           normalize(excelEmp.center) === normalize(dbEmp.center) &&
                           normalize(excelEmp.phone_direct) === normalize(dbEmp.phone_direct) &&
                           normalize(excelEmp.email) === normalize(dbEmp.email) &&
                           normalize(excelEmp.national_id) === normalize(dbEmp.national_id) &&
                           normalize(excelEmp.nationality) === normalize(dbEmp.nationality) &&
                           normalize(excelEmp.gender) === normalize(dbEmp.gender) &&
                           getComparableDate(excelEmp.date_of_birth) === getComparableDate(dbEmp.date_of_birth) &&
                           normalize(excelEmp.classification_id) === normalize(dbEmp.classification_id);
                };

                uniqueEmployees.forEach((excelEmp, index) => {
                    const rowIndex = index + 2; // Excel row number
                    if (!excelEmp.full_name_ar) validationIssues.push({ rowIndex, message: "حقل 'الاسم باللغة العربية' فارغ." });
                    
                    const existingEmp = existingEmployeesMap.get(excelEmp.employee_id.trim());
                    if (!existingEmp) {
                        recordsToCreate.push(excelEmp);
                    } else {
                        if (areEmployeesEqual(excelEmp, existingEmp)) {
                            ignoredCount++;
                        } else {
                            recordsToUpdate.push({ old: existingEmp, new: excelEmp });
                        }
                    }
                });

                setImportPreview({
                    summary: {
                        create: recordsToCreate.length,
                        update: recordsToUpdate.length,
                        ignored: ignoredCount,
                    },
                    data: {
                        toCreate: recordsToCreate,
                        toUpdate: recordsToUpdate,
                    },
                    validationIssues,
                    dataType: 'employees',
                    fileInfo: { name: file.name, size: file.size },
                });

            } catch (err: any) {
                console.error("Import error:", err);
                addToast('فشل استيراد الملف', err.message || 'تأكد من صحة التنسيق وعدم وجود تكرار.', 'error');
            }
        };
        reader.readAsArrayBuffer(file);
    };
    
    const handleExportEmployees = () => {
        const dataToExport = filteredEmployees.map(emp => ({
            'الرقم الوظيفي': emp.employee_id,
            'الاسم باللغة العربية': emp.full_name_ar,
            'الاسم باللغة الإنجليزية': emp.full_name_en,
            'المسمى الوظيفي': emp.job_title,
            'القطاع': emp.department,
            'المركز': emp.center,
            'رقم الجوال': emp.phone_direct,
            'البريد الإلكتروني': emp.email,
            'السجل المدني / الإقامة': emp.national_id,
            'الجنسية': emp.nationality,
            'الجنس': emp.gender,
            'تاريخ الميلاد': emp.date_of_birth ? new Date(emp.date_of_birth).toLocaleDateString('ar-SA') : '',
            'رقم التصنيف': emp.classification_id
        }));
        
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'الموظفين');
        XLSX.writeFile(workbook, 'employees_export.xlsx');
        addToast('تم تصدير الموظفين بنجاح', '', 'success');
    };

    const handleConfirmImport = async (selections: UpdateSelection) => {
        if (!importPreview) return;

        setImportProgress({
            isOpen: true,
            fileName: importPreview.fileInfo.name,
            fileSize: importPreview.fileInfo.size,
            progress: 0,
        });
        setImportPreview(null);

        try {
            const { toCreate, toUpdate } = importPreview.data;
            const idKey = importPreview.dataType === 'employees' ? 'employee_id' : 'name';
    
            const updatedRecords = toUpdate.map(item => {
                const id = item.old[idKey as keyof typeof item.old];
                const selectedFields = selections[id as any];
                if (!selectedFields || selectedFields.size === 0) return null;
    
                const finalRecord = { ...item.old };
                selectedFields.forEach(field => {
                    if (field in item.new) {
                        (finalRecord as any)[field] = (item.new as any)[field];
                    }
                });
                // Set updated_at timestamp for records that are being updated
                (finalRecord as any).updated_at = new Date().toISOString();
                return finalRecord;
            }).filter(Boolean) as (Employee[] | OfficeContact[]);
    
            const dataToUpsert = [...toCreate, ...updatedRecords];
            
            if (dataToUpsert.length === 0) {
                addToast('لا توجد تغييرات', 'لم يتم اختيار أي سجلات جديدة أو محدثة للاستيراد.', 'info');
                setImportProgress(prev => ({...prev, isOpen: false}));
                return;
            }

            const tableName = importPreview.dataType === 'employees' ? 'employees' : 'office_contacts';
            const onConflict = importPreview.dataType === 'employees' ? 'employee_id' : 'name';

            const CHUNK_SIZE = 50;
            const totalRecords = dataToUpsert.length;
            let processedRecords = 0;

            for (let i = 0; i < totalRecords; i += CHUNK_SIZE) {
                const chunk = dataToUpsert.slice(i, i + CHUNK_SIZE);
                
                // For upsert, we should not send 'id' or 'created_at'.
                // 'id' is auto-generated for new records. The database default is used for 'created_at'.
                // For updates, 'id' is not needed due to `onConflict`, and we want to preserve the original 'created_at'.
                const chunkForUpsert = chunk.map(record => {
                    const { id, created_at, ...rest } = record as any;
                    return rest;
                });

                const { error } = await supabase.from(tableName).upsert(chunkForUpsert, { onConflict });
                if (error) throw error;
                
                processedRecords += chunk.length;
                const currentProgress = (processedRecords / totalRecords) * 100;
                setImportProgress(prev => ({ ...prev, progress: currentProgress }));
            }
            
            setImportProgress(prev => ({ ...prev, progress: 100 }));
            
            if(importPreview.dataType === 'employees') {
                const { data } = await supabase.from('employees').select('*');
                setEmployees(data || []);
            } else {
                 const { data } = await supabase.from('office_contacts').select('*');
                setOfficeContacts(data || []);
            }

            const totalImportedCount = toCreate.length + updatedRecords.length;
            logActivity(currentUser, importPreview.dataType === 'employees' ? 'IMPORT_EMPLOYEES' : 'IMPORT_CONTACTS', {
                count: totalImportedCount,
                created: toCreate.length,
                updated: updatedRecords.length,
                ignored: importPreview.summary.ignored + (toUpdate.length - updatedRecords.length),
            });

            const summaryMsg = `جديد: ${toCreate.length} | تحديث: ${updatedRecords.length} | تجاهل: ${importPreview.summary.ignored + (toUpdate.length - updatedRecords.length)}`;
            addToast('اكتمل الاستيراد بنجاح', summaryMsg, 'success');

        } catch (err: any) {
            console.error("Confirm Import error:", err);
            addToast('فشل الاستيراد', err.message || 'حدث خطأ أثناء حفظ البيانات.', 'error');
        } finally {
            setTimeout(() => {
                setImportProgress({ isOpen: false, fileName: '', fileSize: 0, progress: 0 });
            }, 1000);
        }
    };


    const handleSaveOfficeContact = async (contactData: Omit<OfficeContact, 'id'> & { id?: number }) => {
        const isEditing = !!contactData.id;
        const dataWithTimestamp = { ...contactData, updated_at: new Date().toISOString() };
        const { data, error } = await supabase.from('office_contacts').upsert(dataWithTimestamp).select();
        
        if (error) {
            addToast('فشل حفظ جهة الاتصال', error.message, 'error');
        } else if (data) {
             const savedContact = data[0];
             if (!isEditing) {
                setOfficeContacts(prev => [...prev, savedContact]);
                logActivity(currentUser, 'CREATE_CONTACT', { contactId: savedContact.id, contactName: savedContact.name });
            } else {
                logActivity(currentUser, 'UPDATE_CONTACT', { contactId: savedContact.id, contactName: savedContact.name });
            }
            addToast(`تم ${isEditing ? 'تحديث' : 'إضافة'} جهة الاتصال بنجاح`, '', 'success');
            setShowAddOfficeContactModal(false);
            setContactToEdit(null);
        }
    };

    const handleDeleteOfficeContact = async (contact: OfficeContact) => {
        requestConfirmation('تأكيد الحذف', `هل أنت متأكد من رغبتك في حذف "${contact.name}"؟`, async () => {
            const { error } = await supabase.from('office_contacts').delete().eq('id', contact.id);
            if (error) {
                addToast('فشل الحذف', error.message, 'error');
            } else {
                logActivity(currentUser, 'DELETE_CONTACT', { contactId: contact.id, contactName: contact.name });
                addToast('تم حذف جهة الاتصال بنجاح', '', 'deleted');
            }
        });
    };
    
    const handleImportOfficeContacts = (file: File) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: null });

                const newContacts = json.map(row => ({
                    name: String(row['اسم المكتب'] ?? '').trim(),
                    extension: String(row['التحويلة'] ?? '').trim(),
                    location: String(row['الموقع'] ?? '').trim(),
                    email: String(row['البريد الإلكتروني'] ?? '').trim(),
                }));

                const uniqueContactsMap = new Map<string, typeof newContacts[0]>();
                newContacts.forEach(contact => {
                    if (contact.name) {
                        uniqueContactsMap.set(contact.name.trim(), contact);
                    }
                });
                const uniqueContacts = Array.from(uniqueContactsMap.values());

                if (uniqueContacts.length === 0) {
                    addToast('لا توجد بيانات صالحة', 'لم يتم العثور على جهات اتصال في الملف.', 'warning');
                    return;
                }

                const excelContactNames = uniqueContacts.map(c => c.name);
                const { data: existingContactsData, error: fetchError } = await supabase
                    .from('office_contacts')
                    .select('*')
                    .in('name', excelContactNames);
                if (fetchError) throw fetchError;
                
                const existingContactsMap = new Map<string, OfficeContact>(existingContactsData.map(c => [c.name.trim(), c]));

                const recordsToCreate: Omit<OfficeContact, 'id'>[] = [];
                const recordsToUpdate: UpdatePreview<OfficeContact>[] = [];
                let ignoredCount = 0;
                const validationIssues: ValidationIssue[] = [];
                
                const areContactsEqual = (excelContact: typeof newContacts[0], dbContact: OfficeContact) => {
                     const normalize = (val: any) => {
                        if (val === null || val === undefined || String(val).trim() === '') return null;
                        return String(val).trim();
                    };
                     return normalize(excelContact.name) === normalize(dbContact.name) &&
                            normalize(excelContact.extension) === normalize(dbContact.extension) &&
                            normalize(excelContact.location) === normalize(dbContact.location) &&
                            normalize(excelContact.email) === normalize(dbContact.email);
                };

                uniqueContacts.forEach((excelContact, index) => {
                    const rowIndex = index + 2;
                    if (!excelContact.name) validationIssues.push({ rowIndex, message: "حقل 'اسم المكتب' فارغ." });
                    if (!excelContact.extension) validationIssues.push({ rowIndex, message: "حقل 'التحويلة' فارغ." });

                    const existingContact = existingContactsMap.get(excelContact.name);
                    if (!existingContact) {
                        recordsToCreate.push(excelContact);
                    } else {
                        if (areContactsEqual(excelContact, existingContact)) {
                            ignoredCount++;
                        } else {
                            recordsToUpdate.push({ old: existingContact, new: excelContact });
                        }
                    }
                });

                setImportPreview({
                    summary: { create: recordsToCreate.length, update: recordsToUpdate.length, ignored: ignoredCount },
                    data: { toCreate: recordsToCreate, toUpdate: recordsToUpdate },
                    validationIssues,
                    dataType: 'contacts',
                    fileInfo: { name: file.name, size: file.size },
                });

            } catch (err: any) {
                console.error("Import error:", err);
                addToast('فشل استيراد الملف', err.message || 'تأكد من صحة التنسيق وعدم وجود تكرار.', 'error');
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleExportOfficeContacts = () => {
        const dataToExport = officeContacts.map(c => ({
            'اسم المكتب': c.name,
            'التحويلة': c.extension,
            'الموقع': c.location,
            'البريد الإلكتروني': c.email
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'تحويلات المكاتب');
        XLSX.writeFile(workbook, 'office_contacts_export.xlsx');
        addToast('تم تصدير التحويلات بنجاح', '', 'success');
    };

    const handleSaveTask = async (taskData: Omit<Task, 'id'> & { id?: number }) => {
        const isEditing = !!taskData.id;
        const dataWithTimestamp = { ...taskData, updated_at: new Date().toISOString() };
        const { data, error } = await supabase.from('tasks').upsert(dataWithTimestamp).select();
        if (error) {
            addToast('فشل حفظ المهمة', error.message, 'error');
        } else if (data) {
            const savedTask = data[0];
            if (!isEditing) {
                setTasks(prev => [...prev, savedTask]);
                logActivity(currentUser, 'CREATE_TASK', { taskId: savedTask.id, taskTitle: savedTask.title });
            } else {
                 logActivity(currentUser, 'UPDATE_TASK', { taskId: savedTask.id, taskTitle: savedTask.title });
            }
            addToast(`تم ${isEditing ? 'تحديث' : 'إضافة'} المهمة بنجاح`, '', 'success');
            setShowAddTaskModal(false);
            setTaskToEdit(null);
        }
    };
    
    const handleDeleteTask = (task: Task) => {
        requestConfirmation('تأكيد الحذف', `هل أنت متأكد من رغبتك في حذف مهمة "${task.title}"؟`, async () => {
            const { error } = await supabase.from('tasks').delete().eq('id', task.id);
            if (error) {
                addToast('فشل الحذف', error.message, 'error');
            } else {
                logActivity(currentUser, 'DELETE_TASK', { taskId: task.id, taskTitle: task.title });
                addToast('تم حذف المهمة بنجاح', '', 'deleted');
                setSelectedTask(null); // Close detail modal on successful delete
            }
        });
    };
    
    const handleToggleTaskComplete = async (taskId: number) => {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            const newStatus = !task.is_completed;
            const { data, error } = await supabase.from('tasks').update({ 
                is_completed: newStatus,
                updated_at: new Date().toISOString()
            }).eq('id', taskId).select();
            if (error) {
                addToast('فشل تحديث حالة المهمة', error.message, 'error');
            } else if (data) {
                const updatedTask = data[0];
                if(selectedTask && selectedTask.id === taskId) {
                    setSelectedTask(updatedTask);
                }
                if (newStatus) {
                    logActivity(currentUser, 'COMPLETE_TASK', { taskId: task.id, taskTitle: task.title, status: 'completed' });
                    addToast('اكتملت المهمة بنجاح', '', 'success');
                } else {
                    logActivity(currentUser, 'UPDATE_TASK', { taskId: task.id, taskTitle: task.title, status: 're-opened' });
                    addToast('أعيد فتح المهمة', '', 'info');
                }
            }
        }
    };

    const handleSaveTransaction = async (transactionData: Omit<Transaction, 'id'> & { id?: number }) => {
        const isEditing = !!transactionData.id;
        
        const payload: any = {
            transaction_number: transactionData.transaction_number,
            subject: transactionData.subject,
            type: transactionData.type,
            platform: transactionData.platform,
            status: transactionData.status,
            date: transactionData.date,
            description: transactionData.description ?? null,
            attachment: transactionData.attachment ?? null,
            linked_employee_id: transactionData.linked_employee_id ?? null,
            linked_office_contact_id: transactionData.linked_office_contact_id ?? null,
            updated_at: new Date().toISOString(),
        };

        if (isEditing) {
            payload.id = transactionData.id;
        }

        const { data, error } = await supabase.from('transactions').upsert(payload).select('*');
        
        if (error) {
            addToast('فشل حفظ المعاملة', error.message, 'error');
        } else if (data) {
            const savedTransaction = data[0];
             if (!isEditing) {
                 logActivity(currentUser, 'CREATE_TRANSACTION', { transactionId: savedTransaction.id, transactionSubject: savedTransaction.subject });
            } else {
                logActivity(currentUser, 'UPDATE_TRANSACTION', { transactionId: savedTransaction.id, transactionSubject: savedTransaction.subject });
            }
            addToast(`تم ${isEditing ? 'تحديث' : 'إضافة'} المعاملة بنجاح`, '', 'success');
            setShowAddTransactionModal(false);
            setTransactionToEdit(null);
        }
    };
    
    const handleDeleteTransaction = (transaction: Transaction) => {
        requestConfirmation('تأكيد الحذف', `هل أنت متأكد من رغبتك في حذف المعاملة رقم "${transaction.transaction_number}"؟`, async () => {
            const { error } = await supabase.from('transactions').delete().eq('id', transaction.id);
            if (error) {
                addToast('فشل حذف المعاملة', error.message, 'error');
            } else {
                logActivity(currentUser, 'DELETE_TRANSACTION', { transactionId: transaction.id, transactionNumber: transaction.transaction_number });
                addToast('تم حذف المعاملة بنجاح', '', 'deleted');
            }
             setSelectedTransaction(null); // Close detail modal
        });
    };
    
    const handleCycleTransactionStatus = async (transactionId: number) => {
        const transaction = transactions.find(t => t.id === transactionId);
        if (!transaction || transaction.status === 'completed') return;

        let nextStatus: TransactionStatus;
        const statusTextMap = {
            inProgress: 'قيد الإجراء',
            followedUp: 'متابعة',
            completed: 'منجزة'
        };

        switch (transaction.status) {
            case 'new':
                nextStatus = 'inProgress';
                break;
            case 'inProgress':
                nextStatus = 'followedUp';
                break;
            case 'followedUp':
                nextStatus = 'completed';
                break;
            default:
                return; // Should not reach here due to the initial check
        }
        
        const { error } = await supabase.from('transactions').update({ status: nextStatus, updated_at: new Date().toISOString() }).eq('id', transactionId);

        if (error) {
            addToast('فشل تحديث حالة المعاملة', error.message, 'error');
        } else {
            const nextStatusText = statusTextMap[nextStatus as keyof typeof statusTextMap];
            logActivity(currentUser, 'UPDATE_TRANSACTION_STATUS', { transactionId: transaction.id, transactionSubject: transaction.subject, newStatus: nextStatus });
            addToast(`تم تحديث الحالة إلى "${nextStatusText}"`, '', 'info');
        }
    };

    const handleGenericImport = () => {
        const handlerMap = {
            directory: handleImportEmployees,
            officeDirectory: handleImportOfficeContacts,
            tasks: () => addToast('استيراد المهام غير مدعوم', '', 'info'),
            transactions: () => addToast('استيراد المعاملات غير مدعوم', '', 'info'),
            orgChart: () => {},
            statistics: () => {},
        };
        const handler = handlerMap[activeTab];
        setImportHandler(() => handler);
        genericFileInputRef.current?.click();
    };

    const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && importHandler) {
            importHandler(file);
        }
        if(event.target) event.target.value = '';
    };

    if (isAuthenticating) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-gray-900">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-primary dark:border-gray-700 dark:border-t-primary"></div>
            </div>
        );
    }
    
    if (!currentUser) {
        return <LoginScreen />;
    }

    if (justLoggedIn) {
        return <WelcomeScreen currentUser={currentUser} />;
    }

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
            <Header 
                onOpenSettings={() => setShowSettings(true)}
                onOpenGlobalSearch={() => setGlobalSearchOpen(true)}
             />
            
            <main className="container mx-auto px-3 md:px-6 flex-grow pb-24 md:pb-6">
                 <Tabs activeTab={activeTab} setActiveTab={(tab) => {
                    setActiveTab(tab);
                 }} />

                 {loading ? (
                    <SkeletonLoader activeTab={activeTab} />
                 ) : (
                    <div key={activeTab} className="animate-tab-content-in">
                        {activeTab === 'directory' && (
                            <>
                                <SearchAndFilter
                                    onImportClick={handleGenericImport}
                                    onAddEmployeeClick={() => { setEmployeeToEdit(null); setShowAddEmployeeModal(true); }}
                                    onExportClick={handleExportEmployees}
                                    onSortClick={() => setShowSortModal(true)}
                                    employees={employees}
                                    activeFilters={activeFilters}
                                    onFilterChange={setActiveFilters}
                                />
                                <EmployeeList
                                    employees={visibleEmployees}
                                    onSelectEmployee={setSelectedEmployee}
                                    onLoadMore={loadMoreEmployees}
                                    hasMore={hasMoreEmployees}
                                    isLoadingMore={isLoadingMore}
                                />
                            </>
                        )}
                        {activeTab === 'orgChart' && <OrganizationalChartView employees={employees} />}
                        {activeTab === 'officeDirectory' && (
                            <OfficeDirectory
                                contacts={officeContacts}
                                onAddContact={() => { setContactToEdit(null); setShowAddOfficeContactModal(true); }}
                                onEditContact={(contact) => { setContactToEdit(contact); setShowAddOfficeContactModal(true); }}
                                onDeleteContact={handleDeleteOfficeContact}
                                onImportClick={handleGenericImport}
                                onExportClick={handleExportOfficeContacts}
                            />
                        )}
                         {activeTab === 'tasks' && (
                            <TasksView 
                                tasks={tasks}
                                onAddTask={() => { setTaskToEdit(null); setShowAddTaskModal(true); }}
                                onToggleComplete={handleToggleTaskComplete}
                                onSelectTask={setSelectedTask}
                                onImportClick={() => addToast('استيراد المهام غير مدعوم', '', 'info')}
                                onExportClick={() => addToast('تصدير المهام غير مدعوم', '', 'info')}
                            />
                         )}
                         {activeTab === 'transactions' && (
                            <TransactionsView
                                transactions={transactions}
                                onAddTransaction={() => { setTransactionToEdit(null); setShowAddTransactionModal(true); }}
                                onEditTransaction={(t) => { setTransactionToEdit(t); setShowAddTransactionModal(true); }}
                                onDeleteTransaction={handleDeleteTransaction}
                                onSelectTransaction={setSelectedTransaction}
                                onCycleStatus={handleCycleTransactionStatus}
                                onImportClick={() => addToast('استيراد المعاملات غير مدعوم', '', 'info')}
                                onExportClick={() => addToast('تصدير المعاملات غير مدعوم', '', 'info')}
                            />
                         )}
                         {activeTab === 'statistics' && <StatisticsView currentUser={currentUser} employees={employees} transactions={transactions} officeContacts={officeContacts} tasks={tasks} />}
                    </div>
                 )}
            </main>

            <BottomNavBar activeTab={activeTab} setActiveTab={setActiveTab} />
            
            <SettingsScreen isOpen={showSettings} onClose={() => setShowSettings(false)} />

            <input
                type="file"
                ref={genericFileInputRef}
                onChange={handleFileSelected}
                accept=".xlsx, .xls"
                className="hidden"
            />
            
            <ImportProgressModal
                isOpen={importProgress.isOpen}
                fileName={importProgress.fileName}
                fileSize={importProgress.fileSize}
                progress={importProgress.progress}
            />

            {importPreview && (
                <ImportPreviewModal
                    isOpen={!!importPreview}
                    onClose={() => setImportPreview(null)}
                    onConfirm={handleConfirmImport}
                    summary={importPreview.summary}
                    data={importPreview.data}
                    validationIssues={importPreview.validationIssues}
                    isProcessing={importProgress.isOpen}
                    dataType={importPreview.dataType}
                />
            )}

            <GlobalSearch 
                isOpen={isGlobalSearchOpen}
                onClose={() => setGlobalSearchOpen(false)}
                employees={employees}
                officeContacts={officeContacts}
                tasks={tasks}
                transactions={transactions}
                onSelectEmployee={(emp) => { setGlobalSearchOpen(false); setSelectedEmployee(emp); }}
                onSelectTask={(task) => { setGlobalSearchOpen(false); setSelectedTask(task); }}
                onSelectTransaction={(trans) => { setGlobalSearchOpen(false); setSelectedTransaction(trans); }}
            />

            {selectedEmployee && (
                <EmployeeProfileModal
                    isOpen={!!selectedEmployee}
                    employee={selectedEmployee}
                    onClose={() => setSelectedEmployee(null)}
                    onEdit={(emp) => {
                        setSelectedEmployee(null);
                        setTimeout(() => {
                            setEmployeeToEdit(emp);
                            setShowAddEmployeeModal(true);
                        }, 100);
                    }}
                    onDelete={handleDeleteEmployee}
                />
            )}
            
            {(showAddEmployeeModal || employeeToEdit) && (
                 <AddEmployeeModal
                    isOpen={showAddEmployeeModal || !!employeeToEdit}
                    onClose={() => {
                        setShowAddEmployeeModal(false);
                        setEmployeeToEdit(null);
                    }}
                    onSave={handleSaveEmployee}
                    employeeToEdit={employeeToEdit}
                />
            )}

            {(showAddOfficeContactModal || contactToEdit) && (
                <AddOfficeContactModal
                    isOpen={showAddOfficeContactModal || !!contactToEdit}
                    onClose={() => {
                        setShowAddOfficeContactModal(false);
                        setContactToEdit(null);
                    }}
                    onSave={handleSaveOfficeContact}
                    contactToEdit={contactToEdit}
                />
            )}

             {(showAddTaskModal || taskToEdit) && (
                 <AddTaskModal
                    isOpen={showAddTaskModal || !!taskToEdit}
                    onClose={() => { setShowAddTaskModal(false); setTaskToEdit(null); }}
                    onSave={handleSaveTask}
                    taskToEdit={taskToEdit}
                />
            )}

            {selectedTask && (
                <TaskDetailModal
                    isOpen={!!selectedTask}
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                    onEdit={(task) => {
                        setSelectedTask(null);
                        setTimeout(() => {
                            setTaskToEdit(task);
                            setShowAddTaskModal(true);
                        }, 100);
                    }}
                    onDelete={handleDeleteTask}
                    onToggleComplete={handleToggleTaskComplete}
                />
            )}

            {(showAddTransactionModal || transactionToEdit) && (
                <AddTransactionModal
                    isOpen={showAddTransactionModal || !!transactionToEdit}
                    onClose={() => { setShowAddTransactionModal(false); setTransactionToEdit(null); }}
                    onSave={handleSaveTransaction}
                    transactionToEdit={transactionToEdit}
                    employees={employees}
                    officeContacts={officeContacts}
                />
            )}
            
            {selectedTransaction && (
                <TransactionDetailModal
                    isOpen={!!selectedTransaction}
                    transaction={selectedTransaction}
                    onClose={() => setSelectedTransaction(null)}
                    onEdit={(t) => {
                        setSelectedTransaction(null);
                        setTimeout(() => {
                           setTransactionToEdit(t);
                           setShowAddTransactionModal(true);
                        }, 100);
                    }}
                    onDelete={handleDeleteTransaction}
                />
            )}

            <ConfirmationModal 
                isOpen={confirmation.isOpen}
                onClose={closeConfirmation}
                onConfirm={() => {
                    confirmation.onConfirm();
                    closeConfirmation();
                }}
                title={confirmation.title}
                message={confirmation.message}
            />
            
            <SortModal 
                isOpen={showSortModal}
                onClose={() => setShowSortModal(false)}
                currentSort={sortConfig}
                onApplySort={setSortConfig}
            />
        </div>
    );
};

export default App;