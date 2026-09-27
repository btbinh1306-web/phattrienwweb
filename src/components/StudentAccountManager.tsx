import React, { useEffect, useState } from 'react';
import { CheckCircle2, Save, UserPlus } from 'lucide-react';
import { ExamLesson, StudentAccount } from '../types';
import { fetchStudentAccounts, saveStudentAccount } from '../services/studentAccountService';
import { groupExamsForSelection } from '../utils/examGrouping';

interface StudentAccountManagerProps {
  exams: ExamLesson[];
  teacherPassword: string;
}

const emptyForm = {
  username: '',
  name: '',
  className: '',
  password: '',
  assignmentExamIds: [] as string[]
};

export const StudentAccountManager: React.FC<StudentAccountManagerProps> = ({ exams, teacherPassword }) => {
  const [accounts, setAccounts] = useState<StudentAccount[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedExamGroup, setSelectedExamGroup] = useState('HSK 1');
  const examGroups = groupExamsForSelection(exams);
  const activeExamGroup = examGroups.find((group) => group.label === selectedExamGroup) || examGroups[0];

  const loadAccounts = async () => {
    setIsLoading(true);
    try {
      setAccounts(await fetchStudentAccounts(teacherPassword));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải tài khoản học sinh');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadAccounts();
  }, [teacherPassword]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');
    try {
      const saved = await saveStudentAccount(teacherPassword, { ...form, id: editingId });
      setAccounts((current) => {
        const index = current.findIndex((account) => account.id === saved.id);
        if (index < 0) return [saved, ...current];
        const next = [...current];
        next[index] = saved;
        return next;
      });
      setForm(emptyForm);
      setEditingId(undefined);
      setMessage(`Đã lưu tài khoản ${saved.username}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể lưu tài khoản học sinh');
    } finally {
      setIsLoading(false);
    }
  };

  const edit = (account: StudentAccount) => {
    setEditingId(account.id);
    setForm({
      username: account.username,
      name: account.name,
      className: account.className,
      password: '',
      assignmentExamIds: account.assignments.map((assignment) => assignment.examId)
    });
    setMessage('');
    setError('');
  };

  const toggleExam = (examId: string) => {
    setForm((current) => ({
      ...current,
      assignmentExamIds: current.assignmentExamIds.includes(examId)
        ? current.assignmentExamIds.filter((id) => id !== examId)
        : [...current.assignmentExamIds, examId]
    }));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <UserPlus className="w-5 h-5 text-red-700" />
        <div>
          <h3 className="text-lg font-bold text-slate-900">Tài khoản & bài được giao</h3>
          <p className="text-xs text-slate-500">Tạo tài khoản riêng, chọn đúng các bài học sinh cần làm.</p>
        </div>
      </div>

      <form onSubmit={submit} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="text-sm font-semibold text-slate-700">Tên đăng nhập
            <input value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} disabled={Boolean(editingId)} required className="mt-1.5 w-full px-3 py-2 border border-slate-300 rounded-lg font-normal disabled:bg-slate-100" />
          </label>
          <label className="text-sm font-semibold text-slate-700">Họ tên học sinh
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required className="mt-1.5 w-full px-3 py-2 border border-slate-300 rounded-lg font-normal" />
          </label>
          <label className="text-sm font-semibold text-slate-700">Lớp
            <input value={form.className} onChange={(event) => setForm({ ...form, className: event.target.value })} required className="mt-1.5 w-full px-3 py-2 border border-slate-300 rounded-lg font-normal" />
          </label>
        </div>

        <label className="block text-sm font-semibold text-slate-700">{editingId ? 'Mật khẩu mới (bỏ trống để giữ nguyên)' : 'Mật khẩu'}
          <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required={!editingId} className="mt-1.5 w-full md:max-w-md px-3 py-2 border border-slate-300 rounded-lg font-normal" />
        </label>

        <div>
          <p className="text-sm font-semibold text-slate-700 mb-2">Chọn bài giao</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {examGroups.map((group) => (
              <button
                key={group.label}
                type="button"
                onClick={() => setSelectedExamGroup(group.label)}
                className={`px-3 py-2 rounded-lg border text-sm font-bold transition ${
                  activeExamGroup?.label === group.label
                    ? 'bg-red-700 border-red-700 text-white'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {group.label} <span className="text-xs opacity-80">({group.exams.length})</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto border border-slate-200 rounded-lg p-3">
            {activeExamGroup?.exams.map((exam) => (
              <label key={exam.id} className="flex items-start gap-2 text-sm text-slate-700 p-2 rounded hover:bg-slate-50">
                <input type="checkbox" checked={form.assignmentExamIds.includes(exam.id)} onChange={() => toggleExam(exam.id)} className="mt-1" />
                <span><strong>{exam.title}</strong><br /><span className="text-xs text-slate-500">{exam.level}</span></span>
              </label>
            ))}
          </div>
        </div>

        {message && <p className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-3"><CheckCircle2 className="w-4 h-4" />{message}</p>}
        {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}
        <div className="flex gap-2">
          <button type="submit" disabled={isLoading} className="inline-flex items-center gap-2 bg-red-700 hover:bg-red-800 disabled:opacity-60 text-white font-bold px-4 py-2.5 rounded-lg"><Save className="w-4 h-4" />{editingId ? 'Cập nhật tài khoản' : 'Tạo tài khoản'}</button>
          {editingId && <button type="button" onClick={() => { setEditingId(undefined); setForm(emptyForm); }} className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-semibold">Hủy sửa</button>}
        </div>
      </form>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-100 font-bold text-slate-900">Danh sách tài khoản ({accounts.length})</div>
        {accounts.map((account) => (
          <button key={account.id} type="button" onClick={() => edit(account)} className="w-full text-left p-4 border-b last:border-b-0 border-slate-100 hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span><strong>{account.name}</strong> <span className="text-sm text-slate-500">({account.username} · {account.className})</span></span>
            <span className="text-xs text-slate-500">{account.assignments.length} bài được giao · Sửa</span>
          </button>
        ))}
        {accounts.length === 0 && <p className="p-5 text-sm text-slate-500">Chưa có tài khoản. Tạo tài khoản đầu tiên ở trên.</p>}
      </div>
    </div>
  );
};
