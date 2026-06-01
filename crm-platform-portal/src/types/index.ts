export type UserRole = 'admin' | 'manager' | 'sales_rep' | 'viewer';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  active: boolean;
  created_at: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: User;
  token: string;
}

export interface Contact {
  id: string;
  phone: string;
  first_name: string;
  last_name: string;
  email: string;
  lead_score: number;
  status: 'new' | 'engaged' | 'qualified' | 'closed';
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

export interface ContactsListResponse {
  contacts: Contact[];
  total: number;
}

export interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export interface Team {
  id: string;
  name: string;
  advisors: TeamAdvisor[];
}

export interface TeamAdvisor {
  id: string;
  name: string;
  email: string;
  assigned_leads: number;
}

export interface LeadDistribution {
  [advisorId: string]: number;
}
