import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  KeyRound, 
  ShieldCheck, 
  Trash2, 
  Edit3, 
  AlertCircle, 
  Check, 
  X, 
  User, 
  Briefcase,
  Eye,
  EyeOff,
  Info,
  Copy,
  Wand2,
  CheckCheck
} from 'lucide-react';

interface SystemUser {
  name: string;
  role: string;
  password?: string;
  canDelete: boolean;
  createdAt?: string;
}

export default function UserAccountsManagement() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modals state
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [deleteTargetUser, setDeleteTargetUser] = useState<SystemUser | null>(null);
  const [readTargetUser, setReadTargetUser] = useState<SystemUser | null>(null);
  const [successModalData, setSuccessModalData] = useState<{ title: string; message: string } | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [password, setPassword] = useState('');
  const [canDelete, setCanDelete] = useState(false);
  const [revealedPasswords, setRevealedPasswords] = useState<{ [key: string]: boolean }>({});
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setUsers(data);
        }
      }
    } catch (err) {
      setError('Failed to load system users from Firebase Firestore.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (editingUser) {
        // Update user (UPDATE ACTION)
        const res = await fetch(`/api/admin/users/${encodeURIComponent(editingUser.name)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, role, password, canDelete })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update user.');
        
        setSuccessModalData({
          title: 'User Account Updated Successfully',
          message: `Global credentials and RBAC permissions for "${name}" have been updated and synchronized in Firebase Firestore (/teamUsers collection).`
        });
      } else {
        // Create user (CREATE ACTION)
        const res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, role, password, canDelete })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create user.');

        setSuccessModalData({
          title: 'New User Account Created & Saved to Firestore',
          message: `Secure login credentials generated and stored in Firebase Firestore (/teamUsers/${name.toLowerCase()}) successfully. They can now sign in globally.`
        });
      }

      setShowFormModal(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Operation failed.');
    }
  };

  const confirmDeleteUser = async () => {
    if (!deleteTargetUser) return;
    const userName = deleteTargetUser.name;

    if (userName.toLowerCase() === 'adeyinka meduoye') {
      setError('Cannot delete the primary Super Admin account.');
      setDeleteTargetUser(null);
      return;
    }

    try {
      // DELETE ACTION
      const res = await fetch(`/api/admin/users/${encodeURIComponent(userName)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete user.');

      setDeleteTargetUser(null);
      setSuccessModalData({
        title: 'User Account Deleted',
        message: `Successfully revoked access and deleted user account "${userName}" from Firebase Firestore globally.`
      });
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to delete user.');
      setDeleteTargetUser(null);
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let pass = '';
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
  };

  const handleCopyPassword = (userName: string, pwd?: string) => {
    if (!pwd) return;
    navigator.clipboard.writeText(pwd);
    setCopiedStates(prev => ({ ...prev, [userName]: true }));
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [userName]: false }));
    }, 2000);
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setName('');
    setRole('Enterprise Sales & CRM Operations');
    // Auto-generate strong default password
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let pass = '';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
    setCanDelete(false);
    setShowFormModal(true);
    setError('');
  };

  const openEditModal = (u: SystemUser) => {
    setEditingUser(u);
    setName(u.name);
    setRole(u.role);
    setPassword(u.password || '');
    setCanDelete(u.canDelete);
    setShowFormModal(true);
    setError('');
  };

  const openReadModal = (u: SystemUser) => {
    setReadTargetUser(u);
  };

  const togglePasswordReveal = (userName: string) => {
    setRevealedPasswords(prev => ({
      ...prev,
      [userName]: !prev[userName]
    }));
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-4 sm:p-6 space-y-6" id="user-accounts-root">
      {/* Header & Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-brand-400" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-100 tracking-tight">User Access & RBAC Management</h2>
          </div>
          <p className="text-xs text-slate-400">Stored in Firebase Firestore (/teamUsers collection): Generate secure credentials, copy passwords instantly, and manage staff access.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-brand-500 hover:bg-brand-600 text-white font-medium px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer text-xs sm:text-sm shadow-lg shadow-brand-500/20"
        >
          <UserPlus className="w-4 h-4" /> Create User Account
        </button>
      </div>

      {error && (
        <div className="bg-rose-950/60 border border-rose-900 text-rose-300 p-3.5 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Registered System Users */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono uppercase text-slate-400 tracking-wider">Registered System Users (Firebase Firestore)</h3>
          <span className="text-[10px] font-mono bg-slate-800 px-2.5 py-1 rounded-full text-slate-300">
            {users.length} Active Accounts
          </span>
        </div>
        
        {loading ? (
          <div className="text-center py-12 text-slate-500 text-xs font-mono">Loading user directory from Firestore...</div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs font-mono">No users registered in database.</div>
        ) : (
          <>
            {/* Desktop & Tablet Table View */}
            <div className="hidden md:block overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/60">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] font-mono uppercase text-slate-400 bg-slate-900/80">
                    <th className="py-3 px-4">Full Name</th>
                    <th className="py-3 px-4">Username (Login ID)</th>
                    <th className="py-3 px-4">Password & Tools</th>
                    <th className="py-3 px-4">Role & Access</th>
                    <th className="py-3 px-4">Created</th>
                    <th className="py-3 px-4 text-right">Actions (CRUD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs text-slate-200 font-sans">
                  {users.map((u) => {
                    const isRevealed = revealedPasswords[u.name];
                    const isCopied = copiedStates[u.name];
                    return (
                      <tr key={u.name} className="hover:bg-slate-900/50 transition">
                        <td className="py-3.5 px-4 font-semibold text-slate-100 flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-400 flex items-center justify-center font-bold text-xs uppercase shrink-0 shadow-sm">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <button 
                              onClick={() => openReadModal(u)}
                              className="text-slate-100 hover:text-brand-400 font-semibold text-left transition cursor-pointer"
                              title="Click to view details (Read Action)"
                            >
                              {u.name}
                            </button>
                            <div className="text-[10px] font-mono text-slate-500">Firestore Doc ID</div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-300">{u.name}</td>
                        <td className="py-3.5 px-4 font-mono">
                          <div className="flex items-center gap-2">
                            <span className="bg-slate-900 px-2.5 py-1 rounded border border-slate-800 text-slate-300">
                              {isRevealed ? (u.password || '••••••••') : '••••••••'}
                            </span>
                            <button
                              onClick={() => togglePasswordReveal(u.name)}
                              className="text-slate-500 hover:text-slate-300 transition cursor-pointer p-1"
                              title={isRevealed ? 'Hide Password' : 'Reveal Password'}
                            >
                              {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => handleCopyPassword(u.name, u.password)}
                              className="text-brand-400 hover:text-brand-300 transition cursor-pointer p-1 bg-brand-500/10 rounded border border-brand-500/20"
                              title="Copy Password"
                            >
                              {isCopied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                            {isCopied && <span className="text-[10px] text-emerald-400 font-mono animate-fade">Copied!</span>}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-medium ${
                            u.canDelete ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60' : 'bg-blue-950/60 text-blue-300 border border-blue-800/60'
                          }`}>
                            {u.canDelete ? 'Super Admin' : 'CRM Operator'}
                          </span>
                          <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[180px]">{u.role}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">{u.createdAt || '2026-01-01'}</td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openReadModal(u)}
                              className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-1.5 rounded-lg transition cursor-pointer"
                              title="View Account Details (Read)"
                            >
                              <Info className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => openEditModal(u)}
                              className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-1.5 rounded-lg transition cursor-pointer"
                              title="Edit User & Credentials (Update)"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            {u.name.toLowerCase() !== 'adeyinka meduoye' && (
                              <button
                                onClick={() => setDeleteTargetUser(u)}
                                className="bg-rose-950/60 hover:bg-rose-900 text-rose-300 p-1.5 rounded-lg transition cursor-pointer border border-rose-900/50"
                                title="Delete User (Delete)"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Grid View (Fully Responsive) */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {users.map((u) => {
                const isRevealed = revealedPasswords[u.name];
                const isCopied = copiedStates[u.name];
                return (
                  <div key={u.name} className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-400 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-100 text-sm">{u.name}</h4>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-mono font-medium ${
                            u.canDelete ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60' : 'bg-blue-950/60 text-blue-300 border border-blue-800/60'
                          }`}>
                            {u.canDelete ? 'Super Admin' : 'CRM Operator'}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">{u.createdAt || '2026-01-01'}</span>
                    </div>

                    <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 space-y-2 text-xs">
                      <div className="flex justify-between items-center text-slate-400">
                        <span>Role:</span>
                        <span className="text-slate-200 font-medium text-right truncate max-w-[180px]">{u.role}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-400">
                        <span>Password:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-200">{isRevealed ? (u.password || '••••••••') : '••••••••'}</span>
                          <button
                            onClick={() => togglePasswordReveal(u.name)}
                            className="text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
                          >
                            {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleCopyPassword(u.name, u.password)}
                            className="text-brand-400 hover:text-brand-300 p-1 cursor-pointer bg-brand-500/10 rounded"
                            title="Copy Password"
                          >
                            {isCopied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                      {isCopied && <div className="text-[10px] text-emerald-400 font-mono text-right">Password copied to clipboard!</div>}
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-900">
                      <button
                        onClick={() => openReadModal(u)}
                        className="bg-slate-900 hover:bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer border border-slate-800"
                      >
                        <Info className="w-3.5 h-3.5" /> View
                      </button>
                      <button
                        onClick={() => openEditModal(u)}
                        className="bg-slate-900 hover:bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer border border-slate-800"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </button>
                      {u.name.toLowerCase() !== 'adeyinka meduoye' && (
                        <button
                          onClick={() => setDeleteTargetUser(u)}
                          className="bg-rose-950/60 hover:bg-rose-900 text-rose-300 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer border border-rose-900/60"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* CREATE / UPDATE MODAL WITH GENERATE PASSWORD */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-brand-400" />
                <h3 className="text-base font-bold text-slate-100">
                  {editingUser ? 'Update User Account (Update Action)' : 'Create User Account (Create Action)'}
                </h3>
              </div>
              <button onClick={() => setShowFormModal(false)} className="text-slate-400 hover:text-slate-100 transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">Full Name (Username / Login ID)</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Samuel Johnson"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-brand-500 font-sans"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">Role / Position Description</label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Enterprise Sales & CRM Operations"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-brand-500 font-sans"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono uppercase text-slate-400">Password (Global Login Credential)</label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-brand-400 hover:text-brand-300 text-xs font-mono flex items-center gap-1.5 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20 transition cursor-pointer"
                    title="Generate secure random password"
                  >
                    <Wand2 className="w-3 h-3" /> Generate Password
                  </button>
                </div>
                <div className="relative flex items-center">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5" />
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Set or generate secure password..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-24 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-brand-500 font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => handleCopyPassword('modal', password)}
                    className="absolute right-3 bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1 transition cursor-pointer"
                    title="Copy password to clipboard"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </button>
                </div>
                {copiedStates['modal'] && <div className="text-[10px] text-emerald-400 font-mono mt-1">Password copied!</div>}
              </div>

              <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 p-4 rounded-xl">
                <input
                  type="checkbox"
                  id="canDeleteCheckbox"
                  checked={canDelete}
                  onChange={(e) => setCanDelete(e.target.checked)}
                  className="w-4 h-4 accent-brand-500 rounded cursor-pointer"
                />
                <label htmlFor="canDeleteCheckbox" className="text-xs text-slate-300 cursor-pointer">
                  <span className="font-bold text-slate-100 block">Grant Super Admin Privileges</span>
                  Allows user to view all company leads across regions, delete records, and manage other user accounts.
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium px-4 py-2.5 rounded-xl text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-brand-500 hover:bg-brand-600 text-white font-medium px-5 py-2.5 rounded-xl text-xs transition cursor-pointer shadow-lg shadow-brand-500/25"
                >
                  {editingUser ? 'Save & Update in Firestore' : 'Generate & Save in Firestore'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTargetUser && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 text-rose-400 border-b border-slate-800 pb-4">
              <div className="p-3 bg-rose-950/60 rounded-xl border border-rose-900/60">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">Confirm Account Deletion</h3>
                <p className="text-xs text-slate-400">Delete Action (Firebase Firestore Sync)</p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete admin user <strong className="text-slate-100">"{deleteTargetUser.name}"</strong>? This will instantly revoke their access globally across all sessions and remove them from Firebase Firestore.
            </p>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteTargetUser(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium px-4 py-2.5 rounded-xl text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteUser}
                className="bg-rose-600 hover:bg-rose-700 text-white font-medium px-5 py-2.5 rounded-xl text-xs transition cursor-pointer shadow-lg shadow-rose-600/25"
              >
                Yes, Delete User Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* READ / VIEW DETAILS MODAL */}
      {readTargetUser && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-brand-400" />
                <h3 className="text-base font-bold text-slate-100">User Account Details (Read Action)</h3>
              </div>
              <button onClick={() => setReadTargetUser(null)} className="text-slate-400 hover:text-slate-100 transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-sans">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between"><span className="text-slate-400">Full Name:</span> <span className="text-slate-200 font-semibold">{readTargetUser.name}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Username / ID:</span> <span className="text-slate-200 font-mono">{readTargetUser.name}</span></div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Password:</span> 
                  <div className="flex items-center gap-2">
                    <span className="text-slate-200 font-mono">{readTargetUser.password || '••••••••'}</span>
                    <button
                      onClick={() => handleCopyPassword(readTargetUser.name, readTargetUser.password)}
                      className="text-brand-400 hover:text-brand-300 p-1 bg-brand-500/10 rounded cursor-pointer"
                      title="Copy Password"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between"><span className="text-slate-400">Role / Title:</span> <span className="text-slate-200">{readTargetUser.role}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Privilege Level:</span> <span className={readTargetUser.canDelete ? 'text-amber-400 font-bold' : 'text-blue-400'}>{readTargetUser.canDelete ? 'Super Admin' : 'CRM Operator'}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Date Created:</span> <span className="text-slate-200 font-mono">{readTargetUser.createdAt || '2026-01-01'}</span></div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setReadTargetUser(null)}
                className="bg-brand-500 hover:bg-brand-600 text-white font-medium px-5 py-2.5 rounded-xl text-xs transition cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {successModalData && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 sm:p-8 space-y-6 text-center">
            <div className="w-12 h-12 bg-emerald-950/80 border border-emerald-900 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <Check className="w-6 h-6" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-100">{successModalData.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{successModalData.message}</p>
            </div>

            <button
              onClick={() => setSuccessModalData(null)}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white font-medium py-3 rounded-xl text-xs transition cursor-pointer shadow-lg shadow-brand-500/25"
            >
              Acknowledge & Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
