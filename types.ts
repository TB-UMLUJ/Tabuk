export interface Employee {
  id: number;
  created_at?: string;
  updated_at?: string;
  full_name_ar: string;
  full_name_en: string;
  employee_id: string;
  job_title: string;
  department: string;
  phone_direct: string;
  email: string;
  center?: string;
  national_id?: string;
  nationality?: string;
  gender?: string;
  date_of_birth?: string;
  classification_id?: string;
  certificates?: Certificate[];
  documents?: EmployeeDocument[];
}

export const CertificateTypes = [
  'BLS', 'ACLS', 'PALS', 'NALS', 'ATLS', 'CPR', 'PEARS', 'FALS', 'ATCN', 'Other'
] as const;

export type CertificateType = typeof CertificateTypes[number];

export interface Certificate {
  id: string; // Using a UUID for local state management before saving
  type: CertificateType;
  custom_name?: string;
  expiry_date?: string; // 'YYYY-MM-DD'
  file_url?: string;
  file_name?: string; // path in storage for deletion
  display_file_name?: string; // original user-facing filename
  file?: File; // For handling new file uploads in forms
}

export interface EmployeeDocument {
  id: string; // Using a UUID for local state management before saving
  name: string;
  uploaded_at?: string; // ISO string
  file_url?: string;
  file_name?: string; // path in storage for deletion
  display_file_name?: string; // original user-facing filename
  file?: File; // For handling new file uploads in forms
}


export interface OfficeContact {
  id: number;
  created_at?: string;
  updated_at?: string;
  name: string;
  extension: string;
  location?: string;
  email?: string;
}

export interface Task {
  id: number;
  created_at?: string;
  updated_at?: string;
  title: string;
  description?: string;
  due_date?: string; // Storing as 'YYYY-MM-DD'
  is_completed: boolean;
}

export interface Attachment {
  name: string;
  type: string;
  data: string; // Base64 encoded string
}

export type TransactionType = 'incoming' | 'outgoing';
export type TransactionPlatform = 'Bain' | 'MinisterEmail' | 'HospitalEmail';
export type TransactionStatus = 'new' | 'inProgress' | 'followedUp' | 'completed';

export interface Transaction {
  id: number;
  created_at?: string;
  updated_at?: string;
  transaction_number: string;
  subject: string;
  type: TransactionType;
  platform: TransactionPlatform;
  status: TransactionStatus;
  date: string; // ISO String 'YYYY-MM-DD'
  description?: string;
  attachment?: Attachment;
  linked_employee_id?: number | null;
  linked_office_contact_id?: number | null;
  // For joined data
  linked_employee?: { id: number; full_name_ar: string; } | null;
  linked_office_contact?: { id: number; name: string; } | null;
}

// --- New Notification Types ---
export type NotificationCategory = 'task' | 'transaction' | 'system' | 'employee' | 'contact';

export interface Notification {
  id: number;
  created_at: string;
  title: string;
  message: string;
  category: NotificationCategory;
  is_read: boolean;
  link_id?: number;
}

// --- New RBAC Types ---
export interface Permission {
  permission_id: number;
  permission_name: string;
  description?: string;
}

export interface Role {
  role_id: number;
  role_name: string;
  description?: string;
  role_permissions?: { permissions: Permission }[]; // For Supabase join
}

export interface User {
  user_id: number;
  username: string;
  full_name: string;
  is_active: boolean;
  role: Role;
  role_id: number;
  permissions: string[];
}

// --- New Activity Log Type ---
export interface ActivityLog {
  id: number;
  created_at: string;
  user_id: number;
  user_full_name: string;
  action: string;
  action_type?: string;
  details: Record<string, any>;
}

// --- New Policy Type ---
export interface Policy {
  id: number;
  created_at: string;
  title: string;
  description?: string;
  file_name?: string | null; // The path in storage
  file_url?: string | null;
  display_file_name?: string | null; // The original filename
}

// --- New Activity Log Actions ---
export type ActivityAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'CREATE_EMPLOYEE' | 'UPDATE_EMPLOYEE' | 'DELETE_EMPLOYEE' | 'IMPORT_EMPLOYEES'
  | 'CREATE_CONTACT' | 'UPDATE_CONTACT' | 'DELETE_CONTACT' | 'IMPORT_CONTACTS'
  | 'CREATE_TASK' | 'UPDATE_TASK' | 'DELETE_TASK' | 'COMPLETE_TASK'
  | 'CREATE_TRANSACTION' | 'UPDATE_TRANSACTION' | 'DELETE_TRANSACTION' | 'UPDATE_TRANSACTION_STATUS'
  | 'CREATE_POLICY' | 'UPDATE_POLICY' | 'DELETE_POLICY';

// --- New Global Search Types ---
export interface GlobalSearchResults {
  employees: Employee[];
  officeContacts: OfficeContact[];
  tasks: Task[];
  transactions: Transaction[];
}

// --- New Import System Types ---
export interface ImportSummary {
  create: number;
  update: number;
  ignored: number;
}

export interface ValidationIssue {
  rowIndex: number; // Excel row number
  message: string;
}

// New type to hold the comparison data for an update
export interface UpdatePreview<T> {
    old: T;
    new: Partial<T>; // The incoming data from Excel
}

// New type to manage user selections for updates
export type UpdateSelection = Record<number | string, Set<string>>; // Key is employee/contact ID or name, value is a set of field names to update