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

// FIX: Add Notification and NotificationCategory types to resolve import errors.
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
  file_name: string; // The path in storage
  file_url: string;
  display_file_name?: string; // The original filename
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