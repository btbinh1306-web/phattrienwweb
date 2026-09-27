import { StudentAccount, SubmissionData } from '../types';

export interface StudentDashboard {
  account: StudentAccount;
  submissions: SubmissionData[];
}

export interface StudentAccountInput {
  id?: string;
  username: string;
  name: string;
  className: string;
  password?: string;
  assignmentExamIds: string[];
  active?: boolean;
}

const SESSION_KEY = 'hsk_student_account_session_v1';

type StudentSession = {
  token: string;
  account: StudentAccount;
};

export function getStudentSession(): StudentSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as StudentSession;
    return session?.token && session.account ? session : null;
  } catch {
    return null;
  }
}

export function clearStudentSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function getStudentAuthHeaders(): Record<string, string> {
  const token = getStudentSession()?.token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function loginStudent(username: string, password: string): Promise<StudentSession> {
  const response = await fetch('/api/student-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await response.json();
  if (!response.ok || !data?.ok || !data.account || !data.token) {
    throw new Error(data?.error || 'Đăng nhập không thành công');
  }

  const session = { token: data.token, account: data.account as StudentAccount };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export async function fetchStudentDashboard(): Promise<StudentDashboard> {
  const response = await fetch('/api/student-dashboard', { headers: getStudentAuthHeaders() });
  const data = await response.json();
  if (!response.ok || !data?.ok) {
    clearStudentSession();
    throw new Error(data?.error || 'Không thể tải tài khoản học sinh');
  }

  const session = getStudentSession();
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify({ ...session, account: data.account }));
  return { account: data.account, submissions: Array.isArray(data.submissions) ? data.submissions : [] };
}

export async function fetchStudentAccounts(teacherPassword: string): Promise<StudentAccount[]> {
  const response = await fetch('/api/student-accounts', {
    headers: { 'x-teacher-password': teacherPassword }
  });
  const data = await response.json();
  if (!response.ok || !data?.ok) throw new Error(data?.error || 'Không thể tải tài khoản học sinh');
  return Array.isArray(data.accounts) ? data.accounts : [];
}

export async function saveStudentAccount(teacherPassword: string, account: StudentAccountInput): Promise<StudentAccount> {
  const response = await fetch('/api/student-accounts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-teacher-password': teacherPassword
    },
    body: JSON.stringify({ account })
  });
  const data = await response.json();
  if (!response.ok || !data?.ok || !data.account) {
    throw new Error(data?.error || 'Không thể lưu tài khoản học sinh');
  }
  return data.account;
}
