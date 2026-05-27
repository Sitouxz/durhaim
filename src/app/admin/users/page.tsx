'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Activity, CheckCircle2, Edit, Plus, Search, Shield, Users } from 'lucide-react';

type AdminUser = {
  id: string;
  full_name: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'STAFF';
  status: 'ACTIVE' | 'SUSPENDED';
  notes?: string | null;
  last_login_at?: string | null;
  created_at: string;
  updated_at: string;
};

type ActivityLog = {
  id: string;
  actor_email: string;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  summary: string;
  created_at: string;
};

type UserForm = {
  id?: string;
  full_name: string;
  email: string;
  role: AdminUser['role'];
  status: AdminUser['status'];
  notes: string;
  password: string;
};

const emptyForm: UserForm = {
  full_name: '',
  email: '',
  role: 'STAFF',
  status: 'ACTIVE',
  notes: '',
  password: '',
};

function userToForm(user: AdminUser): UserForm {
  return {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    role: user.role,
    status: user.status,
    notes: user.notes ?? '',
    password: '',
  };
}

function formatDate(value?: string | null) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchUsers = async () => {
    setError('');
    const res = await fetch('/api/admin/users', { cache: 'no-store' });
    const data = await res.json().catch(() => []);
    if (!res.ok) {
      setError(data.error || 'Failed to load users.');
      setUsers([]);
      return;
    }
    setUsers(data);
  };

  const fetchLogs = async () => {
    const res = await fetch('/api/admin/user-logs', { cache: 'no-store' });
    const data = await res.json().catch(() => []);
    if (res.ok) setLogs(data);
  };

  useEffect(() => {
    async function load() {
      setLoading(true);
      await Promise.all([fetchUsers(), fetchLogs()]);
      setLoading(false);
    }

    load();
  }, []);

  const filteredUsers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return users;
    return users.filter((user) => {
      return user.full_name.toLowerCase().includes(normalized)
        || user.email.toLowerCase().includes(normalized)
        || user.role.toLowerCase().includes(normalized)
        || user.status.toLowerCase().includes(normalized);
    });
  }, [query, users]);

  const openNewForm = () => {
    setForm(emptyForm);
    setMessage('');
    setShowForm(true);
  };

  const openEditForm = (user: AdminUser) => {
    setForm(userToForm(user));
    setMessage('');
    setShowForm(true);
  };

  const setField = (field: keyof UserForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const saveUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/admin/users', {
        method: form.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || 'Failed to save user.');
        return;
      }

      setMessage(form.id ? 'User updated.' : 'User created.');
      setShowForm(false);
      await Promise.all([fetchUsers(), fetchLogs()]);
    } catch (saveError) {
      console.error('Failed to save user:', saveError);
      setError('Failed to connect to users API.');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (user: AdminUser) => {
    const nextForm = userToForm(user);
    nextForm.status = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextForm),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || 'Failed to update user status.');
        return;
      }

      setMessage(`User ${nextForm.status === 'ACTIVE' ? 'activated' : 'suspended'}.`);
      await Promise.all([fetchUsers(), fetchLogs()]);
    } catch (statusError) {
      console.error('Failed to update user status:', statusError);
      setError('Failed to connect to users API.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-stack-lg animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display-xl text-headline-lg text-stark-white uppercase">User Management</h1>
          <p className="font-body-md text-on-surface-variant">Manage command center users and review user log activity.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:flex">
          <div className="border border-surface-container-highest bg-charcoal-field px-4 py-3">
            <div className="flex items-center gap-2 text-signal-orange">
              <Users className="h-4 w-4" />
              <span className="font-data-mono text-data-mono">{users.length}</span>
            </div>
            <div className="font-label-caps text-xs uppercase text-on-surface-variant">Users</div>
          </div>
          <div className="border border-surface-container-highest bg-charcoal-field px-4 py-3">
            <div className="flex items-center gap-2 text-operator-green">
              <CheckCircle2 className="h-4 w-4" />
              <span className="font-data-mono text-data-mono">{users.filter((user) => user.status === 'ACTIVE').length}</span>
            </div>
            <div className="font-label-caps text-xs uppercase text-on-surface-variant">Active</div>
          </div>
        </div>
      </div>

      <section className="border border-surface-container-highest bg-charcoal-field">
        {error && <div className="border-b border-error bg-error-container/20 p-4 font-body-md text-error">{error}</div>}
        {message && <div className="border-b border-operator-green bg-operator-green/10 p-4 font-body-md text-operator-green">{message}</div>}

        <div className="flex flex-col gap-3 border-b border-surface-container-highest p-4 md:flex-row md:items-center md:justify-between">
          <form className="flex max-w-md items-center border border-surface-container-highest bg-tactical-black px-3 py-2">
            <Search className="mr-2 h-5 w-5 text-on-surface-variant" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full border-none bg-transparent font-data-mono text-stark-white placeholder:text-on-surface-variant focus:outline-none"
              placeholder="Search users..."
              type="search"
            />
          </form>
          <button
            type="button"
            onClick={openNewForm}
            className="inline-flex items-center justify-center gap-2 bg-signal-orange px-4 py-2 font-label-caps text-tactical-black hover:bg-stark-white"
          >
            <Plus className="h-4 w-4" />
            New User
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-surface-container-highest bg-surface-container-lowest">
                <th className="px-4 py-3 font-label-caps uppercase text-on-surface-variant">User</th>
                <th className="px-4 py-3 font-label-caps uppercase text-on-surface-variant">Role</th>
                <th className="px-4 py-3 font-label-caps uppercase text-on-surface-variant">Status</th>
                <th className="px-4 py-3 font-label-caps uppercase text-on-surface-variant">Last Login</th>
                <th className="px-4 py-3 text-right font-label-caps uppercase text-on-surface-variant">Actions</th>
              </tr>
            </thead>
            <tbody className="font-data-mono text-sm text-stark-white">
              {loading ? (
                <tr><td className="px-4 py-8 text-center text-on-surface-variant" colSpan={5}>Loading users...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td className="px-4 py-8 text-center text-on-surface-variant" colSpan={5}>No users found.</td></tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-surface-container-highest/50 hover:bg-surface-container-highest/30">
                    <td className="px-4 py-4">
                      <div className="text-signal-orange">{user.full_name}</div>
                      <div className="text-on-surface-variant">{user.email}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-2">
                        <Shield className="h-3 w-3" />
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-xs ${user.status === 'ACTIVE' ? 'bg-operator-green/15 text-operator-green' : 'bg-error-container/20 text-error'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-on-surface-variant">{formatDate(user.last_login_at)}</td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-3">
                        <button type="button" onClick={() => openEditForm(user)} className="inline-flex items-center gap-1 text-on-surface-variant underline hover:text-signal-orange">
                          <Edit className="h-3 w-3" />
                          Edit
                        </button>
                        <button type="button" onClick={() => toggleStatus(user)} disabled={saving} className="text-on-surface-variant underline hover:text-signal-orange disabled:opacity-50">
                          {user.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border border-surface-container-highest bg-charcoal-field">
        <div className="flex items-center gap-3 border-b border-surface-container-highest p-4">
          <Activity className="h-5 w-5 text-signal-orange" />
          <h2 className="font-headline-md text-headline-md uppercase text-stark-white">Activity Log</h2>
        </div>
        <div className="divide-y divide-surface-container-highest/60">
          {logs.length === 0 ? (
            <div className="p-6 text-center font-body-md text-on-surface-variant">No user log activity yet.</div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="grid gap-2 p-4 md:grid-cols-[180px_minmax(0,1fr)_180px] md:items-center">
                <div className="font-data-mono text-data-mono uppercase text-signal-orange">{log.action}</div>
                <div>
                  <div className="font-body-md text-stark-white">{log.summary}</div>
                  <div className="font-data-mono text-data-mono text-on-surface-variant">Actor: {log.actor_email}</div>
                </div>
                <div className="font-data-mono text-data-mono text-on-surface-variant md:text-right">{formatDate(log.created_at)}</div>
              </div>
            ))
          )}
        </div>
      </section>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-tactical-black/80 p-4 backdrop-blur-sm">
          <form onSubmit={saveUser} className="grid max-h-[90vh] w-full max-w-3xl gap-4 overflow-y-auto border border-surface-container-highest bg-charcoal-field p-stack-lg shadow-2xl lg:grid-cols-2">
            <div className="lg:col-span-2">
              <h2 className="font-headline-md uppercase text-stark-white">{form.id ? 'Edit User' : 'New User'}</h2>
            </div>
            <div>
              <label className="mb-2 block font-label-caps text-on-surface-variant">Full Name</label>
              <input value={form.full_name} onChange={(event) => setField('full_name', event.target.value)} className="w-full border border-surface-container-highest bg-tactical-black p-3 text-stark-white" required />
            </div>
            <div>
              <label className="mb-2 block font-label-caps text-on-surface-variant">Email</label>
              <input value={form.email} onChange={(event) => setField('email', event.target.value)} className="w-full border border-surface-container-highest bg-tactical-black p-3 text-stark-white" type="email" required />
            </div>
            <div>
              <label className="mb-2 block font-label-caps text-on-surface-variant">Role</label>
              <select value={form.role} onChange={(event) => setField('role', event.target.value)} className="w-full border border-surface-container-highest bg-tactical-black p-3 text-stark-white">
                <option value="OWNER">OWNER</option>
                <option value="ADMIN">ADMIN</option>
                <option value="STAFF">STAFF</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block font-label-caps text-on-surface-variant">Status</label>
              <select value={form.status} onChange={(event) => setField('status', event.target.value)} className="w-full border border-surface-container-highest bg-tactical-black p-3 text-stark-white">
                <option value="ACTIVE">ACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
              </select>
            </div>
            <div className="lg:col-span-2">
              <label className="mb-2 block font-label-caps text-on-surface-variant">
                {form.id ? 'New Password (optional)' : 'Password'}
              </label>
              <input
                value={form.password}
                onChange={(event) => setField('password', event.target.value)}
                className="w-full border border-surface-container-highest bg-tactical-black p-3 text-stark-white"
                minLength={12}
                placeholder={form.id ? 'Leave blank to keep current password' : 'Minimum 12 characters'}
                type="password"
                required={!form.id}
              />
            </div>
            <div className="lg:col-span-2">
              <label className="mb-2 block font-label-caps text-on-surface-variant">Notes</label>
              <textarea value={form.notes} onChange={(event) => setField('notes', event.target.value)} className="min-h-24 w-full border border-surface-container-highest bg-tactical-black p-3 text-stark-white" />
            </div>
            <div className="flex justify-end gap-3 lg:col-span-2">
              <button type="button" onClick={() => setShowForm(false)} className="border border-surface-container-highest px-4 py-2 font-label-caps text-stark-white hover:text-signal-orange">Cancel</button>
              <button type="submit" disabled={saving} className="bg-signal-orange px-4 py-2 font-label-caps text-tactical-black hover:bg-stark-white disabled:opacity-60">
                {saving ? 'Saving...' : 'Save User'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
