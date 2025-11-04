

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

// --- New Activity Log Types ---
export type ActionType = 'إضافة' | 'تعديل' | 'حذف' | 'إكمال' | 'إعادة فتح' | 'تحديث حالة' | 'تسجيل دخول' | 'تسجيل خروج';
export type TargetType = 'موظف' | 'مهمة' | 'معاملة' | 'تحويلة مكتب' | 'مستخدم' | 'النظام';

export interface ActivityLog {
  id: number;
  created_at: string;
  user_id: number | null;
  user_full_name: string;
  action_type: ActionType;
  target_type: TargetType | null;
  description: string;
}

// --- New Notification Types ---
export type NotificationCategory = 'task' | 'transaction' | 'system';

export interface Notification {
  id: number;
  created_at: string;
  title: string;
  message: string;
  category: NotificationCategory;
  is_read: boolean;
  link_id?: number; // e.g., task id or transaction id
}