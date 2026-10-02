export type UserRole = 'citizen' | 'admin' | 'resolver';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  department_id?: number | null;
  department_name?: string;
  department_code?: string;
  avatar_url?: string;
}

export type IssueStatus =
  | 'Reported'
  | 'Verified'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved'
  | 'Citizen Verified'
  | 'Closed';

export type PriorityLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export interface Category {
  id: number;
  code: string;
  name: string;
  description?: string;
  default_department_id?: number;
  default_department_name?: string;
  default_severity?: string;
  icon?: string;
}

export interface Department {
  id: number;
  code: string;
  name: string;
  description?: string;
  contact_email?: string;
  active_resolvers_count?: number;
  icon?: string;
  active_issues_count?: number;
  resolved_issues_count?: number;
  staff_count?: number;
}

export interface Report {
  id: number;
  report_code: string;
  user_id: number;
  issue_id?: number | null;
  title: string;
  description: string;
  category_id: number;
  category_name?: string;
  category_icon?: string;
  reporter_name?: string;
  reporter_email?: string;
  location_id?: number;
  latitude: number;
  longitude: number;
  address: string;
  landmark?: string;
  status: IssueStatus;
  photo_url?: string;
  is_duplicate: number;
  duplicate_of_report_id?: number | null;
  priority_score: number;
  created_at: string;
  updated_at?: string;
  issue_code?: string;
  issue_title?: string;
  distanceMeters?: number;
}

export interface AiAnalysisData {
  id?: number;
  category_detected?: string;
  issue_type?: string;
  severity?: string;
  confidence?: number;
  keywords?: string[];
  location_references?: string[];
  safety_risk_score?: number;
  priority_score?: number;
  priority_reasons?: string[];
  recommended_department_id?: number;
  similar_reports_count?: number;
  is_potential_duplicate?: number | boolean;
}

export interface TimelineEvent {
  id: number;
  issue_id: number;
  from_status?: string | null;
  to_status: string;
  changed_by_name?: string;
  changed_by_role?: string;
  notes?: string;
  created_at: string;
}

export interface ProgressUpdate {
  id: number;
  issue_id: number;
  user_id: number;
  author_name: string;
  author_role: string;
  status: string;
  message: string;
  evidence_url?: string;
  created_at: string;
}

export interface CitizenFeedback {
  id: number;
  issue_id: number;
  user_id: number;
  citizen_name: string;
  citizen_email: string;
  is_resolved_confirmed: number;
  comments?: string;
  evidence_url?: string;
  created_at: string;
}

export interface CommunityIssue {
  id: number;
  issue_code: string;
  title: string;
  description?: string;
  category_id: number;
  category_name?: string;
  category_icon?: string;
  department_id?: number | null;
  department_name?: string;
  department_code?: string;
  department_contact?: string;
  status: IssueStatus;
  priority_score: number;
  priority_level: PriorityLevel;
  latitude: number;
  longitude: number;
  address?: string;
  landmark?: string;
  affected_reports_count: number;
  assigned_to_user_id?: number | null;
  assigned_resolver_name?: string;
  assigned_resolver_email?: string;
  resolution_notes?: string;
  resolution_proof_url?: string;
  resolved_at?: string | null;
  verified_by_citizen: number;
  verification_status: 'Pending' | 'Verified' | 'Disputed';
  verification_notes?: string;
  created_at: string;
  updated_at: string;
  reports?: Report[];
  aiAnalysis?: AiAnalysisData;
  timeline?: TimelineEvent[];
  progressUpdates?: ProgressUpdate[];
  feedback?: CitizenFeedback[];
}

export interface NotificationItem {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  link_url?: string;
  is_read: number;
  created_at: string;
}
