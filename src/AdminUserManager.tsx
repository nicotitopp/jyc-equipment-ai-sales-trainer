import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Key, Trash2, X, 
  CheckCircle2, AlertCircle, Loader2, Eye, EyeOff,
  Copy, PhoneCall, ChevronRight, ArrowLeft, Check, Ban
} from 'lucide-react';

interface AdminUserManagerProps {
  onClose: () => void;
}

interface RecentCallSummary {
  id: string;
  date: string;
  companyName: string;
  contactName: string;
  score: number;
  type: string;
}

interface DetailedUser {
  id: string;
  username: string;
  name: string;
  role: 'trainee' | 'admin';
  password: string;
  createdAt: string;
  blocked?: boolean;
  callCount: number;
  avgScore: number;
  bestScore: number;
  passRate: number;
  lastActive?: string;
  recentCalls: RecentCallSummary[];
}

export default function AdminUserManager({ onClose }: AdminUserManagerProps) {
  const [users, setUsers] = useState<DetailedUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [selectedUser, setSelectedUser] = useState<DetailedUser | null>(null);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [creating, setCreating] = useState(false);

  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [changingPass, setChangingPass] = useState(false);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [dbStatus, setDbStatus] = useState<{ mode?: string; connected?: boolean } | null>(null);

  const fetchUsers = async (keepSelectedUsername?: string) => {
    setLoadingUsers(true);
    try {
      fetch('/api/status').then(r => r.json()).then(d => {
        if (d && d.database) setDbStatus(d.database);
      }).catch(() => {});

      const res = await fetch('/api/users/list');
      if (res.ok) {
        const data = await res.json();
        const list: DetailedUser[] = data.users || [];
        setUsers(list);

        if (keepSelectedUsername) {
          const found = list.find(u => u.username === keepSelectedUsername);
          if (found) setSelectedUser(found);
        } else if (selectedUser) {
          const found = list.find(u => u.username === selectedUser.username);
          if (found) setSelectedUser(found);
        }
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!newUsername.trim() || !newName.trim() || !newPassword.trim()) {
      setFeedback({ type: 'error', message: 'Please fill in all fields to register the sales rep.' });
      return;
    }

    setCreating(true);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requesterRole: 'admin',
          username: newUsername.trim(),
          name: newName.trim(),
          password: newPassword.trim()
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Could not create user.');
      }

      setFeedback({ 
        type: 'success', 
        message: `Sales rep '${data.user.name}' (@${data.user.username}) registered successfully.` 
      });
      setNewUsername('');
      setNewName('');
      setNewPassword('');
      setShowCreateForm(false);
      await fetchUsers(data.user.username);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Connection error.' });
    } finally {
      setCreating(false);
    }
  };

  const handleChangePassword = async (username: string) => {
    if (!newPasswordInput.trim()) {
      alert('Please enter a new password.');
      return;
    }

    setChangingPass(true);
    try {
      const res = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requesterRole: 'admin',
          targetUsername: username,
          newPassword: newPasswordInput.trim()
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Could not update password.');
      }

      setFeedback({ 
        type: 'success', 
        message: `Password updated for '@${username}'.` 
      });
      setIsEditingPassword(false);
      setNewPasswordInput('');
      await fetchUsers(username);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error updating password.' });
    } finally {
      setChangingPass(false);
    }
  };

  const handleDeleteUser = async (username: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete '@${username}' (${name})?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${username}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requesterRole: 'admin' })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Could not delete user.');
      }

      setFeedback({ type: 'success', message: `User '@${username}' deleted successfully.` });
      if (selectedUser?.username === username) {
        setSelectedUser(null);
      }
      fetchUsers();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error deleting user.' });
    }
  };

  const handleToggleBlock = async (username: string, currentlyBlocked?: boolean) => {
    const actionText = currentlyBlocked ? 'reactivate access for' : 'temporarily suspend access for';
    if (!window.confirm(`Are you sure you want to ${actionText} '@${username}'?`)) {
      return;
    }

    try {
      const res = await fetch('/api/admin/users/toggle-block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requesterRole: 'admin',
          targetUsername: username
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error updating access status.');
      }

      setFeedback({ type: 'success', message: data.message });
      await fetchUsers(username);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error updating access status.' });
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const togglePasswordVisibility = (username: string) => {
    setShowPasswordMap(prev => ({ ...prev, [username]: !prev[username] }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-900">
        
        {/* Header */}
        <div className="bg-[#0F172A] p-5 sm:p-6 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="font-display font-bold text-base">Sales Rep Management & Access</h3>
                {dbStatus && (
                  <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${
                    dbStatus.mode === 'postgres' && dbStatus.connected
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                      : 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                  }`}>
                    {dbStatus.mode === 'postgres' && dbStatus.connected
                      ? 'Database Connected'
                      : 'Local Storage'}
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-xs mt-0.5">
                Register new sales reps, view or reset passwords, and track team performance
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-left flex-1">
          
          {feedback && (
            <div className={`p-4 rounded-xl text-xs sm:text-sm flex items-center justify-between border ${
              feedback.type === 'success' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <div className="flex items-center gap-2">
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span className="font-medium">{feedback.message}</span>
              </div>
              <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {selectedUser ? (
            <div className="space-y-6">
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setIsEditingPassword(false);
                }}
                className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to sales reps list</span>
              </button>

              {/* Profile & Credentials Card */}
              <div className="bg-slate-50 rounded-2xl p-5 sm:p-6 border border-slate-200 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-[#0F172A] text-amber-400 flex items-center justify-center shrink-0 font-display font-bold text-lg">
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg font-display font-bold text-slate-900">{selectedUser.name}</h2>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
                          {selectedUser.role === 'admin' ? 'Supervisor' : 'Sales Rep'}
                        </span>
                        {selectedUser.role !== 'admin' && (
                          selectedUser.blocked ? (
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                              <Ban className="w-3 h-3" /> Access suspended
                            </span>
                          ) : (
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Active
                            </span>
                          )
                        )}
                      </div>
                      <p className="text-slate-500 text-xs mt-0.5">User: @{selectedUser.username}</p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right text-xs text-slate-500">
                    <span>Registration date:</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{selectedUser.createdAt || 'Active'}</p>
                  </div>
                </div>

                {/* Credentials Box */}
                <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <Key className="w-4 h-4 text-amber-600" />
                      <span>Access Credentials</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(`Username: ${selectedUser.username}\nPassword: ${selectedUser.password}`, 'all')}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedType === 'all' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedType === 'all' ? 'Copied' : 'Copy credentials'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between border border-slate-200/80">
                      <div>
                        <span className="text-[11px] font-medium text-slate-500 block">Username</span>
                        <span className="font-mono text-sm font-semibold text-slate-900 select-all">{selectedUser.username}</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(selectedUser.username, 'user')}
                        className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                        title="Copy username"
                      >
                        {copiedType === 'user' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between border border-slate-200/80">
                      <div className="flex-1 pr-2">
                        <span className="text-[11px] font-medium text-slate-500 block">Password</span>
                        <span className="font-mono text-sm font-semibold text-slate-900 select-all">
                          {showPasswordMap[selectedUser.username] ? selectedUser.password : '••••••••••••'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => togglePasswordVisibility(selectedUser.username)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                          title={showPasswordMap[selectedUser.username] ? 'Hide password' : 'Show password'}
                        >
                          {showPasswordMap[selectedUser.username] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => copyToClipboard(selectedUser.password, 'pass')}
                          className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                          title="Copy password"
                        >
                          {copiedType === 'pass' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    {isEditingPassword ? (
                      <div className="flex items-center gap-2 w-full">
                        <input
                          type="text"
                          value={newPasswordInput}
                          onChange={(e) => setNewPasswordInput(e.target.value)}
                          placeholder="Enter new password..."
                          className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600"
                        />
                        <button
                          onClick={() => handleChangePassword(selectedUser.username)}
                          disabled={changingPass}
                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50"
                        >
                          {changingPass ? 'Saving...' : 'Save password'}
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingPassword(false);
                            setNewPasswordInput('');
                          }}
                          className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-200 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setIsEditingPassword(true);
                          setNewPasswordInput('');
                        }}
                        className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span>Change password for this sales rep</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl">
                  <p className="text-xs font-medium text-slate-500">Completed Practices</p>
                  <p className="text-xl font-display font-bold font-mono text-slate-900 mt-1">{selectedUser.callCount}</p>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl">
                  <p className="text-xs font-medium text-slate-500">Overall Average</p>
                  <p className="text-xl font-display font-bold font-mono text-slate-900 mt-1">
                    {selectedUser.avgScore} <span className="text-xs text-slate-400 font-sans font-normal">/ 100</span>
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl">
                  <p className="text-xs font-medium text-slate-500">Best Score</p>
                  <p className="text-xl font-display font-bold font-mono text-blue-600 mt-1">
                    {selectedUser.bestScore} <span className="text-xs text-slate-400 font-sans font-normal">/ 100</span>
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl">
                  <p className="text-xs font-medium text-slate-500">Pass Rate (≥70)</p>
                  <p className="text-xl font-display font-bold font-mono text-emerald-600 mt-1">{selectedUser.passRate}%</p>
                </div>
              </div>

              {/* Recent Calls */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h4 className="font-display font-bold text-slate-900 text-xs sm:text-sm">
                    Recent Sessions for {selectedUser.name}
                  </h4>
                  <span className="text-xs text-slate-400">{selectedUser.recentCalls.length} displayed</span>
                </div>

                {selectedUser.recentCalls.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    This sales rep has not completed any practice sessions yet.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {selectedUser.recentCalls.map((call) => (
                      <div key={call.id} className="p-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
                            <PhoneCall className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 text-xs sm:text-sm">{call.companyName}</p>
                            <p className="text-xs text-slate-500">Contact: {call.contactName} · {call.date}</p>
                          </div>
                        </div>
                        <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full ${
                          call.score >= 80 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : call.score >= 60 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-red-100 text-red-800'
                        }`}>
                          {call.score}/100
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedUser.role !== 'admin' && (
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-200">
                  <button
                    onClick={() => handleToggleBlock(selectedUser.username, selectedUser.blocked)}
                    className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                      selectedUser.blocked
                        ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                        : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                    }`}
                  >
                    {selectedUser.blocked ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Reactivate Access</span>
                      </>
                    ) : (
                      <>
                        <Ban className="w-4 h-4 text-amber-600" />
                        <span>Suspend Access</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDeleteUser(selectedUser.username, selectedUser.name)}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-red-200"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Account</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-display font-bold text-slate-900 text-sm">Registered Sales Reps</h4>
                  <p className="text-xs text-slate-500">Select a sales rep to check credentials, view past calls, or manage access.</p>
                </div>

                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-display font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer self-start sm:self-auto"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{showCreateForm ? 'Close form' : 'Register new sales rep'}</span>
                </button>
              </div>

              {showCreateForm && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <h4 className="font-display font-bold text-slate-900 text-sm">
                      New Sales Rep
                    </h4>
                    <button onClick={() => setShowCreateForm(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Full name
                      </label>
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="e.g. Carlos Martinez"
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 bg-white text-slate-900"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Username
                      </label>
                      <input
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder="e.g. carlosm"
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 bg-white text-slate-900"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Password
                      </label>
                      <input
                        type="text"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="e.g. Jyc2026*"
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 bg-white text-slate-900"
                        required
                      />
                    </div>

                    <div className="sm:col-span-3 pt-1 flex justify-end">
                      <button
                        type="submit"
                        disabled={creating}
                        className="py-2.5 px-5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
                      >
                        {creating ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Save Sales Rep</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {loadingUsers ? (
                <div className="py-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span>Loading sales reps...</span>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 bg-white">
                  {users.map((u) => (
                    <div 
                      key={u.id}
                      onClick={() => setSelectedUser(u)}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0 font-display font-bold text-sm">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-display font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                              {u.name}
                            </span>
                            <span className="text-xs text-slate-500">
                              @{u.username}
                            </span>
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                              {u.role === 'admin' ? 'Supervisor' : 'Sales Rep'}
                            </span>
                            {u.role !== 'admin' && u.blocked && (
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                                Suspended
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                            <span>{u.callCount} {u.callCount === 1 ? 'practice' : 'practices'}</span>
                            {u.callCount > 0 && (
                              <>
                                <span>·</span>
                                <span>Average: <strong className="text-slate-700">{u.avgScore}/100</strong></span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 justify-end">
                        <span>View details & key</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0">
          <span className="text-xs text-slate-500">
            JYC Equipment · Team Management
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
