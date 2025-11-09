

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { supabase } from './lib/supabaseClient';
import { PostgrestError } from '@supabase/supabase-js';
import { Employee, OfficeContact, Task, Transaction, User, TransactionStatus } from './types';
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
import ImportLoadingModal from './ImportLoadingModal';
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
import { tabukHealthClusterLogoMain } from './components/Logo';
import TaskDetailModal from './components/TaskDetailModal';
import { logActivity } from './lib/activityLogger';
import SkeletonLoader from './components/SkeletonLoader';


declare const XLSX: any;

const App: React.FC = () => {
    const { addToast } = useToast();
    const { currentUser, isAuthenticating, justLoggedIn, clearJustLoggedIn } = useAuth();
    const [showSettings, setShowSettings] = useState(false);
    
    // Data State
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [officeContacts, setOfficeContacts] = useState<OfficeContact[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    // UI & Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'directory' | 'orgChart' | 'officeDirectory' | 'tasks' | 'transactions' | 'statistics'>('statistics');
    const [isImporting, setIsImporting] = useState<boolean>(false);
    const [visibleEmployeeCount, setVisibleEmployeeCount] = useState(10);
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
    
    const searchAndFilterRef = useRef<SearchAndFilterRef>(null);
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

    const filteredEmployees = useMemo(() => {
        return employees.filter(employee => {
            if (searchTerm === '') return true;
            const lowerCaseSearchTerm = searchTerm.toLowerCase();

            return (
                employee.full_name_ar.toLowerCase().includes(lowerCaseSearchTerm) ||
                employee.full_name_en.toLowerCase().includes(lowerCaseSearchTerm) ||
                employee.employee_id.toLowerCase().includes(lowerCaseSearchTerm) ||
                (employee.national_id && employee.national_id.toLowerCase().includes(lowerCaseSearchTerm)) ||
                (employee.center && employee.center.toLowerCase().includes(lowerCaseSearchTerm))
            );
        });
    }, [employees, searchTerm]);

    const visibleEmployees = useMemo(
        () => filteredEmployees.slice(0, visibleEmployeeCount),
        [filteredEmployees, visibleEmployeeCount]
    );

    const hasMoreEmployees = visibleEmployeeCount < filteredEmployees.length;

    const loadMoreEmployees = useCallback(() => {
        if (isLoadingMore) return;
        setIsLoadingMore(true);
        setTimeout(() => {
            setVisibleEmployeeCount(prev => prev + 10);
            setIsLoadingMore(false);
        }, 500);
    }, [isLoadingMore]);


    // --- Handlers ---
    const handleSaveEmployee = async (employeeData: Omit<Employee, 'id'> & { id?: number }) => {
        const isEditing = !!employeeData.id;
        const dataWithTimestamp = { ...employeeData, updated_at: new Date().toISOString() };
        const { data, error } = await supabase.from('employees').upsert(dataWithTimestamp).select();

        if (error) {
            addToast('فشل حفظ الموظف', error.message, 'error');
        } else if (data) {
            const savedEmployee = data[0];
            if (isEditing) {
                setEmployees(prev => prev.map(emp => (emp.id === savedEmployee.id ? savedEmployee : emp)));
                logActivity(currentUser, 'UPDATE_EMPLOYEE', { employeeId: savedEmployee.id, employeeName: savedEmployee.full_name_ar });
            } else {
                setEmployees(prev => [...prev, savedEmployee]);
                 logActivity(currentUser, 'CREATE_EMPLOYEE', { employeeId: savedEmployee.id, employeeName: savedEmployee.full_name_ar });
            }
            addToast(`تم ${isEditing ? 'تحديث' : 'إضافة'} الموظف بنجاح`, '', 'success');
            setShowAddEmployeeModal(false);
            setEmployeeToEdit(null);
        }
    };

    const handleDeleteEmployee = async (employee: Employee) => {
        requestConfirmation(
            'تأكيد الحذف',
            `هل أنت متأكد من رغبتك في حذف الموظف "${employee.full_name_ar}"؟ لا يمكن التراجع عن هذا الإجراء.`,
            async () => {
                const { error } = await supabase.from('employees').delete().eq('id', employee.id);
                if (error) {
                    addToast('فشل حذف الموظف', error.message, 'error');
                } else {
                    logActivity(currentUser, 'DELETE_EMPLOYEE', { employeeId: employee.id, employeeName: employee.full_name_ar });
                    setEmployees(prev => prev.filter(emp => emp.id !== employee.id));
                    addToast('تم حذف الموظف بنجاح', '', 'deleted');
                }
                setSelectedEmployee(null); // Close profile modal after deletion
            }
        );
    };

    const handleImportEmployees = (file: File) => {
        setIsImporting(true);
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array', cellDates: true });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json: any[] = XLSX.utils.sheet_to_json(worksheet);

                const parseExcelDate = (excelDate: any): string | undefined => {
                    if (!excelDate) return undefined;
    
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
                        employee_id: String(row['الرقم الوظيفي'] || '').trim(),
                        full_name_ar: String(row['الاسم باللغة العربية'] || '').trim(),
                        full_name_en: String(row['الاسم باللغة الإنجليزية'] || '').trim(),
                        job_title: String(row['المسمى الوظيفي'] || '').trim(),
                        department: String(row['القطاع'] || '').trim(),
                        center: String(row['المركز'] || '').trim(),
                        phone_direct: String(row['رقم الجوال'] || '').trim(),
                        email: String(row['البريد الإلكتروني'] || '').trim(),
                        national_id: String(row['السجل المدني / الإقامة'] || '').trim(),
                        nationality: String(row['الجنسية'] || '').trim(),
                        gender: String(row['الجنس'] || '').trim(),
                        date_of_birth: parseExcelDate(row['تاريخ الميلاد']),
                        classification_id: String(row['رقم التصنيف'] || '').trim(),
                    }));

                // De-duplicate employees based on employee_id, keeping the last occurrence.
                const uniqueEmployeesMap = new Map<string, Omit<Employee, 'id'>>();
                newEmployees.forEach(employee => {
                    uniqueEmployeesMap.set(employee.employee_id, employee);
                });
                const uniqueEmployees = Array.from(uniqueEmployeesMap.values());

                if (uniqueEmployees.length === 0) {
                    addToast('لا توجد بيانات صالحة', 'لم يتم العثور على موظفين في الملف.', 'warning');
                    setIsImporting(false);
                    return;
                }
                
                const { data: upsertedData, error } = await supabase.from('employees').upsert(uniqueEmployees, { onConflict: 'employee_id' }).select();

                if (error) throw error;
                
                // Merge new data with existing state
                setEmployees(prev => {
                    const existingIds = new Set(prev.map(e => e.employee_id));
                    const trulyNew = upsertedData.filter(e => !existingIds.has(e.employee_id));
                    const updated = prev.map(e => upsertedData.find(u => u.employee_id === e.employee_id) || e);
                    return [...updated, ...trulyNew];
                });
                
                logActivity(currentUser, 'IMPORT_EMPLOYEES', { count: upsertedData.length });
                addToast(`تم استيراد ${upsertedData.length} موظف بنجاح`, '', 'success');

            } catch (err: any) {
                console.error("Import error:", err);
                addToast('فشل استيراد الملف', 'تأكد من صحة التنسيق وعدم وجود تكرار.', 'error');
            } finally {
                setIsImporting(false);
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


    const handleSaveOfficeContact = async (contactData: Omit<OfficeContact, 'id'> & { id?: number }) => {
        const isEditing = !!contactData.id;
        const dataWithTimestamp = { ...contactData, updated_at: new Date().toISOString() };
        const { data, error } = await supabase.from('office_contacts').upsert(dataWithTimestamp).select();
        
        if (error) {
            addToast('فشل حفظ جهة الاتصال', error.message, 'error');
        } else if (data) {
             const savedContact = data[0];
             if (isEditing) {
                setOfficeContacts(prev => prev.map(c => c.id === savedContact.id ? savedContact : c));
                logActivity(currentUser, 'UPDATE_CONTACT', { contactId: savedContact.id, contactName: savedContact.name });
            } else {
                setOfficeContacts(prev => [...prev, savedContact]);
                logActivity(currentUser, 'CREATE_CONTACT', { contactId: savedContact.id, contactName: savedContact.name });
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
                setOfficeContacts(prev => prev.filter(c => c.id !== contact.id));
                addToast('تم حذف جهة الاتصال بنجاح', '', 'deleted');
            }
        });
    };
    
    const handleImportOfficeContacts = (file: File) => {
        setIsImporting(true);
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json: any[] = XLSX.utils.sheet_to_json(worksheet);

                const newContacts = json.map(row => ({
                    name: String(row['اسم المكتب'] || '').trim(),
                    extension: String(row['التحويلة'] || '').trim(),
                    location: String(row['الموقع'] || '').trim(),
                    email: String(row['البريد الإلكتروني'] || '').trim(),
                }));

                // De-duplicate contacts based on name, keeping the last occurrence.
                const uniqueContactsMap = new Map<string, typeof newContacts[0]>();
                newContacts.forEach(contact => {
                    if (contact.name) {
                        uniqueContactsMap.set(contact.name, contact);
                    }
                });
                const uniqueContacts = Array.from(uniqueContactsMap.values());


                if (uniqueContacts.length === 0) {
                    addToast('لا توجد بيانات صالحة', 'لم يتم العثور على جهات اتصال في الملف.', 'warning');
                    setIsImporting(false);
                    return;
                }

                const { data: upsertedData, error } = await supabase.from('office_contacts').upsert(uniqueContacts, { onConflict: 'name' }).select();

                if (error) throw error;

                setOfficeContacts(prev => {
                    const existingNames = new Set(prev.map(c => c.name));
                    const trulyNew = upsertedData.filter(c => !existingNames.has(c.name));
                    const updated = prev.map(c => upsertedData.find(u => u.name === c.name) || c);
                    return [...updated, ...trulyNew];
                });
                
                logActivity(currentUser, 'IMPORT_CONTACTS', { count: upsertedData.length });
                addToast(`تم استيراد ${upsertedData.length} جهة اتصال بنجاح`, '', 'success');
            } catch (err) {
                console.error("Import error:", err);
                addToast('فشل استيراد الملف', 'تأكد من صحة التنسيق وعدم وجود تكرار.', 'error');
            } finally {
                setIsImporting(false);
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
            if (isEditing) {
                setTasks(prev => prev.map(t => (t.id === savedTask.id ? savedTask : t)));
                logActivity(currentUser, 'UPDATE_TASK', { taskId: savedTask.id, taskTitle: savedTask.title });
            } else {
                setTasks(prev => [...prev, savedTask]);
                logActivity(currentUser, 'CREATE_TASK', { taskId: savedTask.id, taskTitle: savedTask.title });
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
                setTasks(prev => prev.filter(t => t.id !== task.id));
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
                setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));

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
            const emp = savedTransaction.linked_employee_id ? employees.find(e => e.id === savedTransaction.linked_employee_id) : null;
            const contact = savedTransaction.linked_office_contact_id ? officeContacts.find(c => c.id === savedTransaction.linked_office_contact_id) : null;
            
            const enrichedTransaction: Transaction = {
                ...savedTransaction,
                linked_employee: emp ? { id: emp.id, full_name_ar: emp.full_name_ar } : null,
                linked_office_contact: contact ? { id: contact.id, name: contact.name } : null,
            };

            if (isEditing) {
                setTransactions(prev => prev.map(t => (t.id === enrichedTransaction.id ? enrichedTransaction : t)));
                logActivity(currentUser, 'UPDATE_TRANSACTION', { transactionId: savedTransaction.id, transactionSubject: savedTransaction.subject });
            } else {
                setTransactions(prev => [enrichedTransaction, ...prev]);
                 logActivity(currentUser, 'CREATE_TRANSACTION', { transactionId: savedTransaction.id, transactionSubject: savedTransaction.subject });
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
                setTransactions(prev => prev.filter(t => t.id !== transaction.id));
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
        
        const originalTransactions = [...transactions];
        const newTimestamp = new Date().toISOString();
        
        // Optimistic update
        setTransactions(prev => prev.map(t => t.id === transactionId ? { ...t, status: nextStatus, updated_at: newTimestamp } : t));

        const { error } = await supabase.from('transactions').update({ status: nextStatus, updated_at: newTimestamp }).eq('id', transactionId);

        if (error) {
            addToast('فشل تحديث حالة المعاملة', error.message, 'error');
            setTransactions(originalTransactions); // Revert on error
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
            <Header onOpenSettings={() => setShowSettings(true)} />
            
            <main className="container mx-auto px-3 md:px-6 flex-grow pb-24 md:pb-6">
                 <Tabs activeTab={activeTab} setActiveTab={(tab) => {
                    setActiveTab(tab);
                    setSearchTerm(''); 
                 }} />

                 {loading ? (
                    <SkeletonLoader activeTab={activeTab} />
                 ) : (
                    <div key={activeTab} className="animate-tab-content-in">
                        {activeTab === 'directory' && (
                            <>
                                <SearchAndFilter
                                    ref={searchAndFilterRef}
                                    searchTerm={searchTerm}
                                    setSearchTerm={setSearchTerm}
                                    onImportClick={handleGenericImport}
                                    onAddEmployeeClick={() => { setEmployeeToEdit(null); setShowAddEmployeeModal(true); }}
                                    onExportClick={handleExportEmployees}
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
            
            <ImportLoadingModal isOpen={isImporting} />

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
            
        </div>
    );
};

export default App;