
export interface Employee {
  id: number;
  created_at?: string;
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
  name: string;
  extension: string;
  location?: string;
  email?: string;
}

export interface Task {
  id: number;
  created_at?: string;
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
export interface Role {
  role_id: number;
  role_name: string;
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
