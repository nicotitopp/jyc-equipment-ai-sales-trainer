import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Key, Trash2, X, Shield, UserCheck, 
  CheckCircle2, AlertCircle, Loader2, RefreshCw, Lock, Eye, EyeOff,
  Copy, Award, PhoneCall, Calendar, ChevronRight, ArrowLeft, BarChart3, Check, Ban, Sparkles
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

  // New user form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [creating, setCreating] = useState(false);

  // Password visibility & editing in details
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [changingPass, setChangingPass] = useState(false);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Feedback message
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
      setFeedback({ type: 'error', message: 'Todos los campos son obligatorios.' });
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
        throw new Error(data.error || 'Error al crear usuario.');
      }

      setFeedback({ 
        type: 'success', 
        message: `¡Vendedor '@${data.user.username}' (${data.user.name}) creado exitosamente!` 
      });
      setNewUsername('');
      setNewName('');
      setNewPassword('');
      setShowCreateForm(false);
      await fetchUsers(data.user.username);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error de conexión.' });
    } finally {
      setCreating(false);
    }
  };

  const handleChangePassword = async (username: string) => {
    if (!newPasswordInput.trim()) {
      alert('Por favor ingresa una nueva contraseña.');
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
        throw new Error(data.error || 'Error al actualizar contraseña.');
      }

      setFeedback({ 
        type: 'success', 
        message: `¡Contraseña de '@${username}' actualizada con éxito en la base de datos central!` 
      });
      setIsEditingPassword(false);
      setNewPasswordInput('');
      await fetchUsers(username);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error al cambiar contraseña.' });
    } finally {
      setChangingPass(false);
    }
  };

  const handleDeleteUser = async (username: string, name: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar permanentemente al usuario '@${username}' (${name})?`)) {
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
        throw new Error(data.error || 'Error al eliminar usuario.');
      }

      setFeedback({ type: 'success', message: `Usuario '@${username}' eliminado correctamente.` });
      if (selectedUser?.username === username) {
        setSelectedUser(null);
      }
      fetchUsers();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error al eliminar usuario.' });
    }
  };

  const handleToggleBlock = async (username: string, currentlyBlocked?: boolean) => {
    const actionText = currentlyBlocked ? 'desbloquear y reactivar el acceso para' : 'bloquear el acceso para';
    if (!window.confirm(`¿Estás seguro de ${actionText} el usuario '@${username}'?`)) {
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
        throw new Error(data.error || 'Error al cambiar estado de bloqueo.');
      }

      setFeedback({ type: 'success', message: data.message });
      await fetchUsers(username);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error al modificar estado de bloqueo.' });
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
    <div className="fixed inset-0 z-50 bg-[#040609]/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0A0F17] rounded-3xl shadow-2xl border border-[#1E293B] max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-100">
        
        {/* Modal Header */}
        <div className="bg-[#080C14] p-5 sm:p-6 text-slate-100 flex items-center justify-between shrink-0 border-b border-[#1E293B]">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/60 text-cyan-400 flex items-center justify-center border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.15)]">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-mono font-bold text-sm sm:text-base tracking-wide uppercase">
                  Gestión de Operadores & Clearance de Acceso
                </h3>
                {dbStatus && (
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                    dbStatus.mode === 'postgres' && dbStatus.connected
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                      : 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                  }`}>
                    {dbStatus.mode === 'postgres' && dbStatus.connected
                      ? '● BD: PostgreSQL (Neon) Persistente'
                      : '○ BD: Archivo Local (data/database.json)'}
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-xs font-mono mt-0.5">
                Alta de vendedores, inspección de contraseñas y auditoría individual de llamadas
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

        {/* Modal Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-left flex-1 custom-scrollbar">
          
          {feedback && (
            <div className={`p-4 rounded-xl text-xs font-mono flex items-center justify-between border ${
              feedback.type === 'success' 
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' 
                : 'bg-red-950/40 border-red-500/50 text-red-300'
            }`}>
              <div className="flex items-center gap-2">
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                )}
                <span>{feedback.message}</span>
              </div>
              <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-200">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* VIEW 1: SELECTED USER DETAILS */}
          {selectedUser ? (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Back to list button */}
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setIsEditingPassword(false);
                }}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#0E1522] hover:bg-[#162032] border border-[#1E293B] text-cyan-300 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver a la lista de operadores</span>
              </button>

              {/* User Overview Profile Card */}
              <div className="bg-[#080C14] text-slate-100 rounded-2xl p-5 sm:p-6 border border-[#1E293B] shadow-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E293B] pb-4">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-mono font-black text-lg border ${
                      selectedUser.role === 'admin' 
                        ? 'bg-indigo-950/80 text-indigo-300 border-indigo-700/60 shadow-[0_0_12px_rgba(99,102,241,0.2)]' 
                        : 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                    }`}>
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base sm:text-lg font-mono font-bold tracking-tight text-slate-100">{selectedUser.name}</h2>
                        <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                          selectedUser.role === 'admin' 
                            ? 'bg-indigo-950 text-indigo-300 border-indigo-800' 
                            : 'bg-cyan-950 text-cyan-300 border-cyan-800'
                        }`}>
                          {selectedUser.role === 'admin' ? 'ADMINISTRADOR' : 'OPERADOR COMERCIAL'}
                        </span>
                        {selectedUser.role !== 'admin' && (
                          selectedUser.blocked ? (
                            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 flex items-center gap-1">
                              <Ban className="w-3 h-3" /> BLOQUEADO
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> ACTIVO
                            </span>
                          )
                        )}
                      </div>
                      <p className="text-cyan-400 font-mono text-xs mt-0.5">CLEARANCE: @{selectedUser.username}</p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right font-mono">
                    <span className="text-[10px] text-slate-400 uppercase">Fecha de Registro:</span>
                    <p className="text-xs font-bold text-slate-200 mt-0.5">{selectedUser.createdAt || 'Activo'}</p>
                  </div>
                </div>

                {/* Password / Credentials Inspection Box */}
                <div className="bg-[#0E1522] rounded-xl p-4 border border-[#1E293B] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
                        Credenciales de Acceso Verificadas
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(`Usuario: ${selectedUser.username}\nContraseña: ${selectedUser.password}`, 'all')}
                      className="px-3 py-1 bg-[#080C14] hover:bg-[#111A29] border border-[#1E293B] text-slate-200 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedType === 'all' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedType === 'all' ? '¡COPIADO!' : 'COPIAR ACCESO COMPLETO'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    
                    {/* Username pill */}
                    <div className="bg-[#080C14] rounded-lg p-3 flex items-center justify-between border border-[#1E293B]">
                      <div>
                        <span className="text-[9px] uppercase font-mono font-bold text-slate-400 block">Usuario</span>
                        <span className="font-mono text-xs sm:text-sm font-bold text-slate-100 select-all">@{selectedUser.username}</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(selectedUser.username, 'user')}
                        className="p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title="Copiar usuario"
                      >
                        {copiedType === 'user' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Password pill with Reveal & Change */}
                    <div className="bg-[#080C14] rounded-lg p-3 flex items-center justify-between border border-[#1E293B]">
                      <div className="flex-1 pr-2">
                        <span className="text-[9px] uppercase font-mono font-bold text-slate-400 block">Contraseña Registrada</span>
                        <span className="font-mono text-xs sm:text-sm font-bold text-amber-300 select-all tracking-wider">
                          {showPasswordMap[selectedUser.username] ? selectedUser.password : '••••••••••••'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => togglePasswordVisibility(selectedUser.username)}
                          className="p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                          title={showPasswordMap[selectedUser.username] ? 'Ocultar contraseña' : 'Ver contraseña creada'}
                        >
                          {showPasswordMap[selectedUser.username] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => copyToClipboard(selectedUser.password, 'pass')}
                          className="p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                          title="Copiar contraseña"
                        >
                          {copiedType === 'pass' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Option to change password */}
                  <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between">
                    {isEditingPassword ? (
                      <div className="flex items-center gap-2 w-full">
                        <input
                          type="text"
                          value={newPasswordInput}
                          onChange={(e) => setNewPasswordInput(e.target.value)}
                          placeholder="Escribe la nueva contraseña..."
                          className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-[#080C14] border border-cyan-500 text-slate-100 placeholder-slate-500 font-mono focus:outline-none"
                        />
                        <button
                          onClick={() => handleChangePassword(selectedUser.username)}
                          disabled={changingPass}
                          className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-mono font-bold cursor-pointer disabled:opacity-50"
                        >
                          {changingPass ? 'Guardando...' : 'Guardar Nueva Clave'}
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingPassword(false);
                            setNewPasswordInput('');
                          }}
                          className="px-3 py-1.5 bg-[#080C14] text-slate-400 rounded-lg text-xs font-mono hover:text-slate-200 cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setIsEditingPassword(true);
                          setNewPasswordInput('');
                        }}
                        className="text-xs text-cyan-400 hover:text-cyan-300 font-mono font-bold flex items-center gap-1.5 cursor-pointer underline underline-offset-4"
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span>Modificar o asignar una nueva contraseña a este operador</span>
                      </button>
                    )}
                  </div>

                </div>

              </div>

              {/* Performance Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#080C14] border border-[#1E293B] p-4 rounded-xl">
                  <p className="text-[9px] uppercase font-mono font-bold text-slate-400">Total Llamadas</p>
                  <p className="text-xl font-mono font-extrabold text-slate-100 mt-1">{selectedUser.callCount}</p>
                </div>

                <div className="bg-[#080C14] border border-[#1E293B] p-4 rounded-xl">
                  <p className="text-[9px] uppercase font-mono font-bold text-slate-400">Promedio General</p>
                  <p className={`text-xl font-mono font-extrabold mt-1 ${
                    selectedUser.avgScore >= 80 ? 'text-emerald-400' : selectedUser.avgScore >= 60 ? 'text-amber-400' : 'text-red-400'
                  }`}>
                    {selectedUser.avgScore} <span className="text-xs text-slate-400 font-sans font-normal">/100</span>
                  </p>
                </div>

                <div className="bg-[#080C14] border border-[#1E293B] p-4 rounded-xl">
                  <p className="text-[9px] uppercase font-mono font-bold text-slate-400">Mejor Puntuación</p>
                  <p className="text-xl font-mono font-extrabold text-cyan-400 mt-1">{selectedUser.bestScore} <span className="text-xs text-slate-400 font-sans font-normal">/100</span></p>
                </div>

                <div className="bg-[#080C14] border border-[#1E293B] p-4 rounded-xl">
                  <p className="text-[9px] uppercase font-mono font-bold text-slate-400">Tasa Aprobación (≥70)</p>
                  <p className="text-xl font-mono font-extrabold text-indigo-400 mt-1">{selectedUser.passRate}%</p>
                </div>
              </div>

              {/* Recent Calls by this user */}
              <div className="bg-[#080C14] border border-[#1E293B] rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-4 sm:p-5 border-b border-[#1E293B] flex items-center justify-between">
                  <h4 className="font-mono font-bold text-slate-200 text-xs uppercase tracking-wider">
                    Llamadas Recientes de {selectedUser.name}
                  </h4>
                  <span className="text-xs text-slate-400 font-mono">{selectedUser.recentCalls.length} registros</span>
                </div>

                {selectedUser.recentCalls.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs font-mono">
                    Este vendedor aún no ha completado llamadas de entrenamiento.
                  </div>
                ) : (
                  <div className="divide-y divide-[#1E293B]">
                    {selectedUser.recentCalls.map((call) => (
                      <div key={call.id} className="p-4 flex items-center justify-between gap-3 hover:bg-[#0E1522] transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg text-xs font-mono font-bold border ${
                            call.type === 'Live Call' 
                              ? 'bg-blue-950/60 text-blue-400 border-blue-700/60' 
                              : 'bg-amber-950/60 text-amber-400 border-amber-700/60'
                          }`}>
                            <PhoneCall className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="font-mono font-bold text-slate-100 text-xs">{call.companyName}</p>
                            <p className="text-[11px] text-slate-400 font-mono">Contacto: {call.contactName} • {call.date}</p>
                          </div>
                        </div>
                        <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${
                          call.score >= 80 
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60' 
                            : call.score >= 60 
                              ? 'bg-amber-950/80 text-amber-300 border-amber-700/60' 
                              : 'bg-red-950/80 text-red-300 border-red-700/60'
                        }`}>
                          {call.score}/100 PTS
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions: Block/Unblock & Delete (Only for non-admin) */}
              {selectedUser.role !== 'admin' && (
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-[#1E293B]">
                  <button
                    onClick={() => handleToggleBlock(selectedUser.username, selectedUser.blocked)}
                    className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border shadow-sm ${
                      selectedUser.blocked
                        ? 'bg-emerald-950/60 hover:bg-emerald-950 text-emerald-300 border-emerald-600'
                        : 'bg-amber-950/60 hover:bg-amber-950 text-amber-300 border-amber-600'
                    }`}
                  >
                    {selectedUser.blocked ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Desbloquear y Reactivar Acceso</span>
                      </>
                    ) : (
                      <>
                        <Ban className="w-4 h-4 text-amber-400" />
                        <span>Bloquear Acceso (Suspender Operador)</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDeleteUser(selectedUser.username, selectedUser.name)}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-950/40 hover:bg-red-950/80 text-red-300 rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer border border-red-700/60"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Eliminar Registro Permanente</span>
                  </button>
                </div>
              )}

            </div>
          ) : (
            /* VIEW 2: LIST OF ALL USERS + CREATE FORM */
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Top Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-mono font-bold text-slate-100 text-sm">Operadores Comerciales Registrados</h4>
                  <p className="text-xs text-slate-400 font-mono">Haz clic en cualquier operador para inspeccionar su contraseña creada y su historial.</p>
                </div>

                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-mono font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all cursor-pointer self-start sm:self-auto"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{showCreateForm ? 'Cerrar Registro' : 'Registrar Nuevo Vendedor'}</span>
                </button>
              </div>

              {/* Collapsible Form: Create New User */}
              {showCreateForm && (
                <div className="bg-[#080C14] border border-cyan-800/60 rounded-2xl p-6 space-y-4 shadow-2xl animate-in fade-in duration-150">
                  <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
                    <div className="flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-cyan-400" />
                      <h4 className="font-mono font-bold text-slate-100 text-xs uppercase tracking-wider">
                        Alta de Operador Comercial
                      </h4>
                    </div>
                    <button onClick={() => setShowCreateForm(false)} className="text-slate-400 hover:text-slate-200">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono font-bold text-slate-300 mb-1 uppercase">
                        Nombre Completo:
                      </label>
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Ej. Carlos Martínez"
                        className="w-full px-3 py-2 text-xs border border-[#1E293B] rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500 bg-[#0E1522] text-slate-100 font-mono"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono font-bold text-slate-300 mb-1 uppercase">
                        Usuario (Login):
                      </label>
                      <input
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder="Ej. carlosm"
                        className="w-full px-3 py-2 text-xs border border-[#1E293B] rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500 bg-[#0E1522] text-slate-100 font-mono"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono font-bold text-slate-300 mb-1 uppercase">
                        Contraseña Asignada:
                      </label>
                      <input
                        type="text"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Ej. Jyc2026*"
                        className="w-full px-3 py-2 text-xs border border-[#1E293B] rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500 bg-[#0E1522] text-slate-100 font-mono"
                        required
                      />
                    </div>

                    <div className="sm:col-span-3 pt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={creating}
                        className="py-2.5 px-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-mono font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(37,99,235,0.3)] cursor-pointer disabled:opacity-50 transition-all"
                      >
                        {creating ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Guardando en PostgreSQL...</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Crear Operador en Base de Datos</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Users Interactive List */}
              {loadingUsers ? (
                <div className="py-12 text-center text-slate-400 text-xs font-mono flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>Sincronizando operadores desde base de datos...</span>
                </div>
              ) : (
                <div className="border border-[#1E293B] rounded-2xl overflow-hidden divide-y divide-[#1E293B] bg-[#080C14] shadow-2xl">
                  {users.map((u) => (
                    <div 
                      key={u.id}
                      onClick={() => setSelectedUser(u)}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#0E1522] cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 font-mono font-black text-sm border ${
                          u.role === 'admin' 
                            ? 'bg-indigo-950/80 text-indigo-300 border-indigo-700/60' 
                            : 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60'
                        }`}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-slate-100 text-sm group-hover:text-cyan-300 transition-colors">
                              {u.name}
                            </span>
                            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-[#0E1522] text-slate-400 border border-[#1E293B]">
                              @{u.username}
                            </span>
                            <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                              u.role === 'admin' 
                                ? 'bg-indigo-950 text-indigo-300 border-indigo-800' 
                                : 'bg-cyan-950 text-cyan-300 border-cyan-800'
                            }`}>
                              {u.role === 'admin' ? 'Admin' : 'Vendedor'}
                            </span>
                            {u.role !== 'admin' && (
                              u.blocked ? (
                                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 flex items-center gap-1">
                                  <Ban className="w-2.5 h-2.5" /> Bloqueado
                                </span>
                              ) : (
                                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                                  Activo
                                </span>
                              )
                            )}
                          </div>

                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 font-mono">
                            <span>
                              Clave: <strong className="text-amber-300">{showPasswordMap[u.username] ? u.password : '••••••••'}</strong>
                            </span>
                            <span>•</span>
                            <span>{u.callCount} {u.callCount === 1 ? 'llamada' : 'llamadas'}</span>
                            {u.callCount > 0 && (
                              <>
                                <span>•</span>
                                <span>Promedio: <strong className="text-slate-200">{u.avgScore}/100</strong></span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right indicator */}
                      <div className="flex items-center gap-2 justify-end">
                        <span className="text-xs font-mono font-bold text-cyan-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                          <span>Ver expediente & clave</span>
                          <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>

                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#080C14] border-t border-[#1E293B] flex justify-between items-center shrink-0">
          <div className="text-[10px] font-mono text-slate-400">
            JYC SALES COCKPIT • PERSISTENCIA POSTGRESQL / NEON
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#0E1522] hover:bg-[#162032] border border-[#1E293B] text-slate-200 rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer"
          >
            Listo / Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}