import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Key, Trash2, X, Shield, UserCheck, 
  CheckCircle2, AlertCircle, Loader2, RefreshCw, Lock
} from 'lucide-react';

interface AdminUserManagerProps {
  onClose: () => void;
}

interface UserRecord {
  id: string;
  username: string;
  name: string;
  role: 'trainee' | 'admin';
  callCount: number;
  avgScore: number;
}

export default function AdminUserManager({ onClose }: AdminUserManagerProps) {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // New user form state
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [creating, setCreating] = useState(false);

  // Password edit state
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [newPasswordForUser, setNewPasswordForUser] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  // Status message
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/users/list');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
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
        message: `¡Usuario '@${data.user.username}' (${data.user.name}) creado exitosamente!` 
      });
      setNewUsername('');
      setNewName('');
      setNewPassword('');
      fetchUsers();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error de conexión.' });
    } finally {
      setCreating(false);
    }
  };

  const handleChangePassword = async (username: string) => {
    if (!newPasswordForUser.trim()) {
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
          newPassword: newPasswordForUser.trim()
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al actualizar contraseña.');
      }

      setFeedback({ 
        type: 'success', 
        message: `¡Contraseña del usuario '@${username}' actualizada con éxito en la base de datos!` 
      });
      setEditingUser(null);
      setNewPasswordForUser('');
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error al cambiar contraseña.' });
    } finally {
      setChangingPass(false);
    }
  };

  const handleDeleteUser = async (username: string, name: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar al usuario '@${username}' (${name})? Esta acción no se puede deshacer.`)) {
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
      fetchUsers();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error al eliminar usuario.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="bg-slate-900 p-6 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h3 className="font-extrabold text-base tracking-tight">Gestión de Vendedores & Accesos</h3>
              <p className="text-slate-400 text-xs">Crea vendedores, asigna contraseñas y administra los accesos</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-left">
          
          {feedback && (
            <div className={`p-4 rounded-2xl text-xs flex items-center gap-2.5 border ${
              feedback.type === 'success' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span className="font-medium">{feedback.message}</span>
            </div>
          )}

          {/* Form: Create New User */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-blue-600" />
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                Crear Nuevo Vendedor / Practicante
              </h4>
            </div>

            <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Nombre Completo:
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej. Carlos Martínez"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Usuario (Login):
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Ej. carlosm"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Contraseña Inicial:
                </label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Ej. Jyc2026*"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-mono"
                  required
                />
              </div>

              <div className="sm:col-span-3 pt-1 flex justify-end">
                <button
                  type="submit"
                  disabled={creating}
                  className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm shadow-blue-200 cursor-pointer disabled:opacity-50 transition-all"
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

          {/* Users Table / List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                Usuarios Registrados en el Sistema ({users.length})
              </h4>
              <button
                onClick={fetchUsers}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-semibold cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                Actualizar lista
              </button>
            </div>

            {loadingUsers ? (
              <div className="py-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                Cargando usuarios...
              </div>
            ) : (
              <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 bg-white">
                {users.map((u) => (
                  <div key={u.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        u.role === 'admin' 
                          ? 'bg-indigo-100 text-indigo-700 font-bold' 
                          : 'bg-blue-100 text-blue-700 font-bold'
                      }`}>
                        {u.role === 'admin' ? <Shield className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{u.name}</span>
                          <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            @{u.username}
                          </span>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            u.role === 'admin' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {u.role === 'admin' ? 'Administrador' : 'Vendedor'}
                          </span>
                        </div>
                        {u.role === 'trainee' && (
                          <p className="text-xs text-slate-400 mt-0.5">
                            {u.callCount} {u.callCount === 1 ? 'llamada registrada' : 'llamadas registradas'} • Promedio: <strong className="text-slate-700">{u.avgScore}/100</strong>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 justify-end">
                      {editingUser === u.username ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={newPasswordForUser}
                            onChange={(e) => setNewPasswordForUser(e.target.value)}
                            placeholder="Nueva clave"
                            className="px-2.5 py-1 text-xs border border-indigo-300 rounded-lg focus:outline-none font-mono"
                          />
                          <button
                            onClick={() => handleChangePassword(u.username)}
                            disabled={changingPass}
                            className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors cursor-pointer"
                          >
                            {changingPass ? 'Guardando...' : 'Guardar'}
                          </button>
                          <button
                            onClick={() => {
                              setEditingUser(null);
                              setNewPasswordForUser('');
                            }}
                            className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-200 cursor-pointer"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingUser(u.username);
                            setNewPasswordForUser('');
                            setFeedback(null);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-slate-700 hover:text-indigo-700 text-xs font-semibold transition-all cursor-pointer"
                          title="Cambiar contraseña de este usuario"
                        >
                          <Key className="w-3.5 h-3.5" />
                          <span>Cambiar Clave</span>
                        </button>
                      )}

                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleDeleteUser(u.username, u.name)}
                          className="p-1.5 rounded-xl border border-transparent hover:border-red-200 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                          title="Eliminar usuario"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
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
