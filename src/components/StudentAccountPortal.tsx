import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BookOpen, Check, Copy, LockKeyhole, LogOut, RefreshCw, UserRound } from 'lucide-react';
import { ExamLesson } from '../types';
import { useStudentExamCatalog } from '../hooks/useStudentExamCatalog';
import {
  clearStudentSession,
  fetchStudentDashboard,
  getStudentSession,
  loginStudent,
  StudentDashboard
} from '../services/studentAccountService';
import { StudentExamForm } from './StudentExamForm';
import { ResultLookup } from './ResultLookup';
import { getExamGroupLabel, groupExamsForSelection } from '../utils/examGrouping';

interface StudentAccountPortalProps {
  customExams?: ExamLesson[];
  deletedExamIds?: string[];
  onSuccessNavigateToResult: (submissionId: string) => void;
}

type StudentItemForSort = {
  title?: string;
  id?: string;
};

const compareStudentItems = (left: StudentItemForSort, right: StudentItemForSort): number => {
  const collator = new Intl.Collator('vi', { numeric: true, sensitivity: 'base' });
  const leftText = `${left.title || ''} ${left.id || ''}`.trim();
  const rightText = `${right.title || ''} ${right.id || ''}`.trim();
  const lessonPattern = /(?:bài|bai)\s*[-:]?\s*(\d+)/i;
  const hskPattern = /hsk\s*(\d+)/i;
  const leftIsLesson = /hsk\s*\d+.*(?:bài|bai)\s*\d+/i.test(leftText) && !/tổng hợp|thử|mock|trial|kiểm tra/i.test(leftText);
  const rightIsLesson = /hsk\s*\d+.*(?:bài|bai)\s*\d+/i.test(rightText) && !/tổng hợp|thử|mock|trial|kiểm tra/i.test(rightText);
  const getKey = (text: string, isLesson: boolean): [number, number, number, string] => {
    const hsk = Number(text.match(hskPattern)?.[1] || 99);
    const lesson = Number(text.match(lessonPattern)?.[1] || 99);
    const category = isLesson
      ? 0
      : /tổng hợp|thử|mock|trial|kiểm tra/i.test(text)
        ? 2
        : /nộp bài|chép từ mới/i.test(text)
          ? 3
          : 1;
    return [category, hsk, lesson, text];
  };

  const leftKey = getKey(leftText, leftIsLesson);
  const rightKey = getKey(rightText, rightIsLesson);
  return leftKey[0] - rightKey[0]
    || leftKey[1] - rightKey[1]
    || leftKey[2] - rightKey[2]
    || collator.compare(leftKey[3], rightKey[3]);
};

const studentLessonNumber = (value: unknown): string => {
  const match = String(value || '').match(/hsk\s*(\d+).*?(?:bài|bai)\s*[-:]?\s*(\d+)/i);
  return match ? `${match[1]}-${match[2]}` : '';
};

const studentLessonMatches = (submissionLesson: unknown, examTitle: unknown): boolean => {
  const submission = String(submissionLesson || '').normalize('NFC').replace(/\s+/g, ' ').trim().toLocaleLowerCase('vi');
  const exam = String(examTitle || '').normalize('NFC').replace(/\s+/g, ' ').trim().toLocaleLowerCase('vi');
  if (!submission || !exam) return false;
  return submission === exam || submission.includes(exam) || exam.includes(submission);
};

export const StudentAccountPortal: React.FC<StudentAccountPortalProps> = ({
  customExams = [],
  deletedExamIds = [],
  onSuccessNavigateToResult
}) => {
  const [session, setSession] = useState(() => getStudentSession());
  const [dashboard, setDashboard] = useState<StudentDashboard | null>(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [assignmentFilter, setAssignmentFilter] = useState('');
  const [guestMode, setGuestMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [copiedSubmissionId, setCopiedSubmissionId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // An assigned lesson is the source of truth for this student's dashboard.
  // A stale global delete flag must not hide work that was explicitly assigned.
  const assignedExamIds = useMemo(
    () => dashboard?.account.assignments.map((assignment) => assignment.examId) || [],
    [dashboard]
  );
  const linkedStudentIds = useMemo(
    () => new Set([dashboard?.account.id, ...(dashboard?.account.linkedAccountIds || [])].filter(Boolean)),
    [dashboard]
  );
  const visibleDeletedExamIds = useMemo(
    () => deletedExamIds.filter((examId) => !assignedExamIds.includes(examId)),
    [assignedExamIds, deletedExamIds]
  );
  const { allExams } = useStudentExamCatalog(customExams, visibleDeletedExamIds);

  const refreshDashboard = async () => {
    setIsLoading(true);
    try {
      setDashboard(await fetchStudentDashboard());
      setSession(getStudentSession());
      setError('');
    } catch (err) {
      clearStudentSession();
      setSession(null);
      setDashboard(null);
      setError(err instanceof Error ? err.message : 'Không thể tải tài khoản học sinh');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session && !guestMode) void refreshDashboard();
  }, [session?.account.id, guestMode]);

  const assignmentRows = useMemo(() => {
    if (!dashboard) return [];
    const examMap = new Map<string, ExamLesson>(allExams.map((exam) => [exam.id, exam]));
    return dashboard.account.assignments
      .map((assignment) => {
        const exam = examMap.get(assignment.examId);
        const submission = dashboard.submissions
          .filter((item) => {
            if (item.assignmentId === assignment.id) return true;
            if (item.studentId && !linkedStudentIds.has(item.studentId)) return false;
            return studentLessonMatches(item.lesson, exam?.title)
              || Boolean(
                /^hsk\d+-bai\d+-5-ky-nang$/i.test(assignment.examId)
                && studentLessonNumber(item.lesson)
                && studentLessonNumber(assignment.examId) === studentLessonNumber(item.lesson)
              );
          })
          .sort((a, b) => String(b.time).localeCompare(String(a.time), 'vi'))[0];
        return { assignment, exam, submission };
      })
      .filter((row) => row.exam)
      .sort((left, right) => compareStudentItems(left.exam!, right.exam!));
  }, [allExams, dashboard, linkedStudentIds]);

  const selectedAssignment = assignmentRows.find((row) => row.assignment.id === selectedAssignmentId);
  const assignmentGroups = useMemo(
    () => groupExamsForSelection(assignmentRows.flatMap(({ exam }) => exam ? [exam] : [])).map((group) => group.label),
    [assignmentRows]
  );
  const visibleAssignmentRows = !assignmentFilter
    ? []
    : assignmentRows.filter(({ exam }) => exam && getExamGroupLabel(exam) === assignmentFilter);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const nextSession = await loginStudent(username, password);
      setSession(nextSession);
      setPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập không thành công');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearStudentSession();
    setSession(null);
    setDashboard(null);
    setSelectedAssignmentId(null);
    setSelectedSubmissionId(null);
    setCopiedSubmissionId(null);
    setError('');
  };

  const copySubmissionId = async (event: React.MouseEvent, submissionId: string) => {
    event.stopPropagation();
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(submissionId);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = submissionId;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopiedSubmissionId(submissionId);
    } catch {
      setError('Không thể sao chép mã bài.');
    }
  };

  if (guestMode) {
    return (
      <section className="space-y-4">
        <button type="button" onClick={() => setGuestMode(false)} className="text-sm font-semibold text-red-700 hover:text-red-900">
          ← Quay lại đăng nhập tài khoản
        </button>
        <StudentExamForm customExams={customExams} deletedExamIds={deletedExamIds} onSuccessNavigateToResult={onSuccessNavigateToResult} />
      </section>
    );
  }

  if (!session) {
    return (
      <section className="max-w-md mx-auto space-y-5">
        <div className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center">
            <UserRound className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Cổng học sinh</h2>
          <p className="text-sm text-slate-600">Đăng nhập để xem bài được giao và kết quả của em.</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <label className="block text-sm font-semibold text-slate-700">
            Tên đăng nhập
            <input value={username} onChange={(event) => setUsername(event.target.value)} className="mt-1.5 w-full px-3 py-2.5 border border-slate-300 rounded-lg font-normal outline-none focus:ring-2 focus:ring-red-500" autoComplete="username" required />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Mật khẩu
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 w-full px-3 py-2.5 border border-slate-300 rounded-lg font-normal outline-none focus:ring-2 focus:ring-red-500" autoComplete="current-password" required />
          </label>
          {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}
          <button type="submit" disabled={isLoading} className="w-full inline-flex items-center justify-center gap-2 bg-red-700 hover:bg-red-800 disabled:opacity-60 text-white font-bold py-2.5 rounded-lg">
            <LockKeyhole className="w-4 h-4" /> {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <button type="button" onClick={() => setGuestMode(true)} className="w-full text-sm text-slate-500 hover:text-slate-800">
          Làm bài theo chế độ cũ không cần tài khoản
        </button>
      </section>
    );
  }

  if (selectedSubmissionId) {
    return (
      <section className="space-y-4">
        <button type="button" onClick={() => setSelectedSubmissionId(null)} className="text-sm font-semibold text-red-700 hover:text-red-900">
          ← Về tài khoản học sinh
        </button>
        <ResultLookup initialSubmissionId={selectedSubmissionId} customExams={customExams} hideSearch />
      </section>
    );
  }

  if (selectedAssignment) {
    return (
      <section className="space-y-4">
        <button type="button" onClick={() => setSelectedAssignmentId(null)} className="text-sm font-semibold text-red-700 hover:text-red-900">
          ← Về bảng bài được giao
        </button>
        <StudentExamForm
          customExams={customExams}
          deletedExamIds={visibleDeletedExamIds}
          allowedExamIds={[selectedAssignment.assignment.examId]}
          studentAccount={dashboard!.account}
          assignmentId={selectedAssignment.assignment.id}
          onSuccessNavigateToResult={async () => {
            setSelectedAssignmentId(null);
            await refreshDashboard();
          }}
        />
      </section>
    );
  }

  return (
    <section className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Xin chào</p>
          <h2 className="text-2xl font-bold text-slate-900">{dashboard?.account.name}</h2>
          <p className="text-sm text-slate-600">{dashboard?.account.className} · {dashboard?.account.username}</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => void refreshDashboard()} disabled={isLoading} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 border border-slate-300 rounded-lg px-3 py-2 hover:bg-slate-50">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Cập nhật
          </button>
          <button type="button" onClick={logout} className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-700 border border-red-200 rounded-lg px-3 py-2 hover:bg-red-50">
            <LogOut className="w-4 h-4" /> Thoát
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Bài được giao</h3>
            <p className="text-sm text-slate-500">Chỉ những bài này mới xuất hiện trong tài khoản.</p>
          </div>
          <BookOpen className="w-6 h-6 text-red-700" />
        </div>

        {assignmentRows.length === 0 ? (
          <p className="bg-white border border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-500">Chưa có bài nào được giao.</p>
        ) : !assignmentFilter ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {assignmentGroups.map((group) => {
              const count = assignmentRows.filter(({ exam }) => exam && getExamGroupLabel(exam) === group).length;
              return (
                <button
                  key={group}
                  type="button"
                  onClick={() => setAssignmentFilter(group)}
                  className="bg-white border border-slate-200 rounded-xl p-5 text-left flex items-center justify-between gap-4 hover:border-red-300 hover:bg-red-50/20 transition"
                >
                  <span>
                    <span className="block text-xl font-bold text-slate-900">{group}</span>
                    <span className="block text-sm text-slate-500 mt-1">{count} bài được giao</span>
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <>
            <button type="button" onClick={() => setAssignmentFilter('')} className="text-sm font-semibold text-red-700 hover:text-red-900">
              ← Chọn HSK khác
            </button>
            {visibleAssignmentRows.map(({ assignment, exam, submission }) => (
              <article key={assignment.id} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-red-700">{exam!.level}</p>
                  <h4 className="text-lg font-bold text-slate-900">{exam!.title}</h4>
                  {submission && <p className="text-xs text-emerald-700 font-semibold mt-2">{submission.status}</p>}
                </div>
                <button type="button" onClick={() => setSelectedAssignmentId(assignment.id)} className="inline-flex items-center justify-center gap-2 shrink-0 bg-red-700 hover:bg-red-800 text-white font-semibold px-4 py-2.5 rounded-lg">
                  {submission ? 'Làm lại / xem bài' : 'Làm bài'} <ArrowRight className="w-4 h-4" />
                </button>
              </article>
            ))}
          </>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="text-xl font-bold text-slate-900">Kết quả</h3>
        {dashboard?.submissions.slice().sort((left, right) => compareStudentItems(
          { title: left.lesson, id: left.id },
          { title: right.lesson, id: right.id }
        )).map((submission) => (
          <div
            key={submission.id}
            onClick={() => setSelectedSubmissionId(submission.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setSelectedSubmissionId(submission.id);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={`Xem chi tiết kết quả ${submission.lesson}`}
            className="w-full text-left bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-red-300 hover:shadow-sm transition cursor-pointer"
          >
            <div>
              <p className="font-bold text-slate-900">{submission.lesson}</p>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>{submission.time}</span>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={(event) => void copySubmissionId(event, submission.id)}
                  className="inline-flex items-center gap-1 font-mono text-red-700 hover:text-red-900 hover:underline"
                  title="Sao chép mã bài"
                  aria-label="Sao chép mã bài"
                >
                  {copiedSubmissionId === submission.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSubmissionId === submission.id ? 'Đã copy' : submission.id}
                </button>
              </div>
            </div>
            <span className="font-bold text-teal-700">{submission.status}</span>
          </div>
        ))}
        {!dashboard?.submissions.length && <p className="text-sm text-slate-500">Chưa có bài nộp.</p>}
      </div>
    </section>
  );
};
