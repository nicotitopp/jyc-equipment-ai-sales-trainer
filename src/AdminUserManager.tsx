import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Key, Trash2, X, Shield, UserCheck, 
  CheckCircle2, AlertCircle, Loader2, RefreshCw, Lock, Eye, EyeOff,
  Copy, Award, PhoneCall, Calendar, ChevronRight, ArrowLeft, BarChart3, Check, Ban
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
        message: `¡Contraseña de '@${username}' actualizada con éxito en la base de datos!` 
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
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="bg-slate-900 p-6 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-base tracking-tight">Gestión de Vendedores & Accesos</h3>
                {dbStatus && (
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
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
              <p className="text-slate-400 text-xs mt-0.5">Crea vendedores, consulta sus contraseñas y audita su actividad</p>
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
        <div className="p-6 overflow-y-auto space-y-6 text-left flex-1">
          
          {feedback && (
            <div className={`p-4 rounded-2xl text-xs flex items-center justify-between border ${
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
              <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600">
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
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver a la lista de vendedores</span>
              </button>

              {/* User Overview Profile Card */}
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-xl font-black ${
                      selectedUser.role === 'admin' 
                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' 
                        : 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    }`}>
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-xl font-black tracking-tight text-white">{selectedUser.name}</h2>
                        <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                          selectedUser.role === 'admin' ? 'bg-indigo-400/20 text-indigo-300 border border-indigo-400/30' : 'bg-blue-400/20 text-blue-300 border border-blue-400/30'
                        }`}>
                          {selectedUser.role === 'admin' ? 'Administrador' : 'Vendedor'}
                        </span>
                        {selectedUser.role !== 'admin' && (
                          selectedUser.blocked ? (
                            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 flex items-center gap-1">
                              <Ban className="w-3 h-3" /> Acceso Bloqueado
                            </span>
                          ) : (
                            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Acceso Activo
                            </span>
                          )
                        )}
                      </div>
                      <p className="text-indigo-200 font-mono text-xs mt-0.5">@{selectedUser.username}</p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[11px] text-slate-400 font-medium">Registrado en:</span>
                    <p className="text-xs font-bold text-white mt-0.5">{selectedUser.createdAt || 'Activo'}</p>
                  </div>
                </div>

                {/* Password / Credentials Inspection Box */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-indigo-300" />
                      <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-200">
                        Credenciales de Acceso Creadas
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(`Usuario: ${selectedUser.username}\nContraseña: ${selectedUser.password}`, 'all')}
                      className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedType === 'all' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedType === 'all' ? '¡Copiado!' : 'Copiar Acceso Completo'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    
                    {/* Username pill */}
                    <div className="bg-black/30 rounded-xl p-3 flex items-center justify-between border border-white/5">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Usuario</span>
                        <span className="font-mono text-sm font-bold text-white select-all">@{selectedUser.username}</span>
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
                    <div className="bg-black/30 rounded-xl p-3 flex items-center justify-between border border-white/5">
                      <div className="flex-1 pr-2">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Contraseña Creada</span>
                        <span className="font-mono text-sm font-black text-amber-300 select-all tracking-wider">
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
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    {isEditingPassword ? (
                      <div className="flex items-center gap-2 w-full">
                        <input
                          type="text"
                          value={newPasswordInput}
                          onChange={(e) => setNewPasswordInput(e.target.value)}
                          placeholder="Escribe la nueva clave..."
                          className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-black/40 border border-indigo-400 text-white placeholder-slate-400 font-mono focus:outline-none"
                        />
                        <button
                          onClick={() => handleChangePassword(selectedUser.username)}
                          disabled={changingPass}
                          className="px-3.5 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50"
                        >
                          {changingPass ? 'Guardando...' : 'Guardar Nueva Clave'}
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingPassword(false);
                            setNewPasswordInput('');
                          }}
                          className="px-3 py-1.5 bg-white/10 text-white rounded-xl text-xs font-semibold hover:bg-white/20 cursor-pointer"
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
                        className="text-xs text-indigo-300 hover:text-white font-bold flex items-center gap-1.5 cursor-pointer underline underline-offset-4"
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span>Cambiar / Asignar una nueva contraseña a este vendedor</span>
                      </button>
                    )}
                  </div>

                </div>

              </div>

              {/* Performance Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Total Llamadas</p>
                  <p className="text-xl font-black text-slate-900 mt-1">{selectedUser.callCount}</p>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Promedio General</p>
                  <p className={`text-xl font-black mt-1 ${
                    selectedUser.avgScore >= 80 ? 'text-emerald-600' : selectedUser.avgScore >= 60 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {selectedUser.avgScore} <span className="text-xs text-slate-400 font-normal">/100</span>
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Mejor Puntuación</p>
                  <p className="text-xl font-black text-blue-600 mt-1">{selectedUser.bestScore} <span className="text-xs text-slate-400 font-normal">/100</span></p>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Tasa Aprobación (≥70)</p>
                  <p className="text-xl font-black text-indigo-600 mt-1">{selectedUser.passRate}%</p>
                </div>
              </div>

              {/* Recent Calls by this user */}
              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                    Llamadas Recientes de {selectedUser.name}
                  </h4>
                  <span className="text-xs text-slate-400 font-medium">{selectedUser.recentCalls.length} llamadas mostradas</span>
                </div>

                {selectedUser.recentCalls.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    Este vendedor aún no ha completado llamadas de entrenamiento.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {selectedUser.recentCalls.map((call) => (
                      <div key={call.id} className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50/50">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl text-xs font-bold ${
                            call.type === 'Live Call' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            <PhoneCall className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-xs">{call.companyName}</p>
                            <p className="text-[11px] text-slate-400">Contacto: {call.contactName} • {call.date}</p>
                          </div>
                        </div>
                        <span className={`text-xs font-black px-2.5 py-1 rounded-xl ${
                          call.score >= 80 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : call.score >= 60 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {call.score}/100
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions: Block/Unblock & Delete (Only for non-admin) */}
              {selectedUser.role !== 'admin' && (
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-200">
                  <button
                    onClick={() => handleToggleBlock(selectedUser.username, selectedUser.blocked)}
                    className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border shadow-xs ${
                      selectedUser.blocked
                        ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300'
                    }`}
                  >
                    {selectedUser.blocked ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Desbloquear y Reactivar Acceso</span>
                      </>
                    ) : (
                      <>
                        <Ban className="w-4 h-4 text-amber-600" />
                        <span>Bloquear Acceso (Suspender Vendedor)</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDeleteUser(selectedUser.username, selectedUser.name)}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-red-200"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Eliminar Vendedor del Sistema</span>
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
                  <h4 className="font-bold text-slate-800 text-sm">Vendedores y Cuentas Registradas</h4>
                  <p className="text-xs text-slate-500">Haz clic en cualquier usuario para ver su contraseña creada y su historial.</p>
                </div>

                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm shadow-blue-200 transition-all cursor-pointer self-start sm:self-auto"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{showCreateForm ? 'Cerrar Formulario' : 'Crear Nuevo Vendedor'}</span>
                </button>
              </div>

              {/* Collapsible Form: Create New User */}
              {showCreateForm && (
                <div className="bg-slate-50 border border-blue-200 rounded-3xl p-6 space-y-4 shadow-sm animate-in fade-in duration-150">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-blue-600" />
                      <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                        Registrar Nuevo Vendedor
                      </h4>
                    </div>
                    <button onClick={() => setShowCreateForm(false)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nombre Completo:
                      </label>
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Ej. Carlos Martínez"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Usuario (Login):
                      </label>
                      <input
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder="Ej. carlosm"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-mono"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Contraseña Asignada:
                      </label>
                      <input
                        type="text"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Ej. Jyc2026*"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-mono"
                        required
                      />
                    </div>

                    <div className="sm:col-span-3 pt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={creating}
                        className="py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm shadow-blue-200 cursor-pointer disabled:opacity-50 transition-all"
                      >
                        {creating ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Creando vendedor...</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Registrar Vendedor</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Users Interactive List */}
              {loadingUsers ? (
                <div className="py-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span>Cargando lista de usuarios...</span>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-3xl overflow-hidden divide-y divide-slate-100 bg-white shadow-sm">
                  {users.map((u) => (
                    <div 
                      key={u.id}
                      onClick={() => setSelectedUser(u)}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-indigo-50/40 cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 font-black text-sm ${
                          u.role === 'admin' 
                            ? 'bg-indigo-100 text-indigo-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                              {u.name}
                            </span>
                            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                              @{u.username}
                            </span>
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                              u.role === 'admin' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}>
                              {u.role === 'admin' ? 'Admin' : 'Vendedor'}
                            </span>
                            {u.role !== 'admin' && (
                              u.blocked ? (
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200 flex items-center gap-1">
                                  <Ban className="w-2.5 h-2.5" /> Bloqueado
                                </span>
                              ) : (
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  Activo
                                </span>
                              )
                            )}
                          </div>

                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 font-medium">
                            <span className="text-slate-400">
                              Clave: <strong className="font-mono text-slate-700">{showPasswordMap[u.username] ? u.password : '••••••••'}</strong>
                            </span>
                            <span>•</span>
                            <span>{u.callCount} {u.callCount === 1 ? 'llamada' : 'llamadas'}</span>
                            {u.callCount > 0 && (
                              <>
                                <span>•</span>
                                <span>Promedio: <strong className="text-slate-800">{u.avgScore}/100</strong></span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right indicator */}
                      <div className="flex items-center gap-3 justify-end">
                        <span className="text-xs font-bold text-indigo-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                          <span>Ver detalles & clave</span>
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
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0">
          <div className="text-[11px] text-slate-400 font-medium">
            JYC Sales Portal • Base de datos centralizada
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Listo / Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
