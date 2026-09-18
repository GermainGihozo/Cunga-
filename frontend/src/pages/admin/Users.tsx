import { useState, useEffect, useCallback } from 'react'
import {
  Users, UserPlus, Search, Edit3, Trash2, Lock,
  ToggleLeft, ToggleRight, ChevronDown, Check, X,
  AlertCircle, RefreshCw, Shield, Store,
} from 'lucide-react'
import { Card, Badge, Spinner } from '@components/common'
import { Button } from '@components/common'
import api from '@services/api'

interface User {
  id: number
  username: string
  email?: string
  role: 'admin' | 'branch'
  branch_id?: number
  branch_name?: string
  is_active: boolean
  last_login?: string
  created_at: string
}

interface Branch { id: number; name: string }

const ROLE_BADGE: Record<string, string> = {
  admin:  'bg-purple-100 text-purple-700',
  branch: 'bg-blue-100 text-blue-700',
}

const fmt = (d?: string) =>
  d ? new Date(d).toLocaleDateString('en-RW', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

export default function AdminUsers() {
  const [users,    setUsers]    = useState<User[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'branch'>('all')
  const [showModal, setShowModal] = useState(false)
  const [showResetModal, setShowResetModal] = useState<User | null>(null)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState('')

  // Form
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'branch', branch_id: '' })
  const [saving, setSaving] = useState(false)
  const [newPassword, setNewPassword] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [usersRes, branchRes] = await Promise.all([
        api.get('/users?limit=100'),
        api.get('/branches?limit=100'),
      ])
      setUsers(usersRes.data.data?.items || [])
      setBranches(branchRes.data.data?.items || [])
    } catch { setError('Failed to load users') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const flash = (msg: string, isError = false) => {
    if (isError) { setError(msg); setTimeout(() => setError(''), 4000) }
    else         { setSuccess(msg); setTimeout(() => setSuccess(''), 3000) }
  }

  const handleCreate = async () => {
    if (!form.username.trim() || !form.password) { flash('Username and password are required', true); return }
    setSaving(true)
    try {
      await api.post('/users', {
        username:  form.username,
        email:     form.email || undefined,
        password:  form.password,
        role:      form.role,
        branch_id: form.branch_id ? Number(form.branch_id) : undefined,
      })
      setShowModal(false)
      setForm({ username: '', email: '', password: '', role: 'branch', branch_id: '' })
      flash('User created successfully')
      load()
    } catch (e: unknown) {
      flash((e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create user', true)
    } finally { setSaving(false) }
  }

  const handleToggle = async (user: User) => {
    try {
      await api.patch(`/users/${user.id}/toggle`)
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: !u.is_active } : u))
      flash(`User ${user.is_active ? 'deactivated' : 'activated'}`)
    } catch { flash('Failed to update user status', true) }
  }

  const handleDelete = async (user: User) => {
    if (!window.confirm(`Delete user "${user.username}"? This cannot be undone.`)) return
    try {
      await api.delete(`/users/${user.id}`)
      setUsers(prev => prev.filter(u => u.id !== user.id))
      flash('User deleted')
    } catch (e: unknown) {
      flash((e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to delete user', true)
    }
  }

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) { flash('Password must be at least 6 characters', true); return }
    setSaving(true)
    try {
      await api.patch(`/users/${showResetModal!.id}/reset-password`, { new_password: newPassword })
      setShowResetModal(null)
      setNewPassword('')
      flash('Password reset successfully')
    } catch { flash('Failed to reset password', true) }
    finally { setSaving(false) }
  }

  const filtered = users.filter(u =>
    (roleFilter === 'all' || u.role === roleFilter) &&
    (u.username.toLowerCase().includes(search.toLowerCase()) ||
     (u.email || '').toLowerCase().includes(search.toLowerCase()))
  )

  const inputCls = 'w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 bg-white transition-colors'

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Users size={28} className="text-primary-600" /> User Management
          </h1>
          <p className="text-gray-500 mt-1">Manage admin and branch staff accounts</p>
        </div>
        <div className="flex gap-3">
          <button onClick={load} className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <Button
            onClick={() => setShowModal(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 shadow-md active:scale-95 transition-all"
          >
            <UserPlus size={18} /> Add User
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {error   && <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium flex items-center gap-2"><AlertCircle size={16} />{error}</div>}
      {success && <div className="px-4 py-3 bg-success-50 border border-success-200 rounded-xl text-sm text-success-700 font-medium flex items-center gap-2"><Check size={16} />{success}</div>}

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search by username or email..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400" />
          </div>
          <div className="relative">
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value as typeof roleFilter)}
              className="appearance-none pl-4 pr-9 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 bg-white font-medium text-gray-700">
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="branch">Branch</option>
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Users size={48} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold">User</th>
                  <th className="px-5 py-3 text-left font-semibold hidden sm:table-cell">Role</th>
                  <th className="px-5 py-3 text-left font-semibold hidden md:table-cell">Branch</th>
                  <th className="px-5 py-3 text-left font-semibold hidden lg:table-cell">Last Login</th>
                  <th className="px-5 py-3 text-left font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{u.username}</p>
                          <p className="text-xs text-gray-400">{u.email || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${ROLE_BADGE[u.role]}`}>
                        {u.role === 'admin' ? <Shield size={11} /> : <Store size={11} />}
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell text-gray-500 text-sm">{u.branch_name || '—'}</td>
                    <td className="px-5 py-4 hidden lg:table-cell text-gray-400 text-xs">{fmt(u.last_login)}</td>
                    <td className="px-5 py-4">
                      <button onClick={() => handleToggle(u)}
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold transition-all active:scale-95 ${u.is_active ? 'text-success-600' : 'text-gray-400'}`}>
                        {u.is_active
                          ? <ToggleRight size={22} className="text-success-500" />
                          : <ToggleLeft size={22} className="text-gray-300" />}
                        <span className="hidden sm:inline">{u.is_active ? 'Active' : 'Inactive'}</span>
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setShowResetModal(u)}
                          className="w-8 h-8 rounded-lg hover:bg-yellow-50 hover:text-yellow-600 text-gray-400 flex items-center justify-center transition-colors" title="Reset password">
                          <Lock size={15} />
                        </button>
                        <button onClick={() => handleDelete(u)}
                          className="w-8 h-8 rounded-lg hover:bg-red-50 hover:text-red-500 text-gray-400 flex items-center justify-center transition-colors" title="Delete user">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && (
          <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
            Showing {filtered.length} of {users.length} users
          </div>
        )}
      </Card>

      {/* Create User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 flex items-center gap-2"><UserPlus size={18} className="text-primary-600" /> Add New User</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 bg-gray-100 hover:bg-red-50 rounded-lg flex items-center justify-center"><X size={15} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Username <span className="text-red-500">*</span></label>
                <input type="text" placeholder="e.g. john_doe" value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                <input type="email" placeholder="john@example.com" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password <span className="text-red-500">*</span></label>
                <input type="password" placeholder="At least 6 characters" value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Role</label>
                  <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className={inputCls}>
                    <option value="branch">Branch Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Branch</label>
                  <select value={form.branch_id} onChange={e => setForm(f => ({ ...f, branch_id: e.target.value }))} className={inputCls}>
                    <option value="">None</option>
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button onClick={() => setShowModal(false)} variant="outline" className="flex-1 py-3 rounded-xl border-2 font-semibold">Cancel</Button>
                <Button onClick={handleCreate} disabled={saving}
                  className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white rounded-xl font-semibold active:scale-95 transition-all">
                  {saving ? 'Creating…' : 'Create User'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 flex items-center gap-2"><Lock size={18} className="text-yellow-600" /> Reset Password</h2>
              <button onClick={() => setShowResetModal(null)} className="w-8 h-8 bg-gray-100 hover:bg-red-50 rounded-lg flex items-center justify-center"><X size={15} /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">Set a new password for <span className="font-bold text-gray-900">{showResetModal.username}</span></p>
              <input type="password" placeholder="New password (min 6 chars)" value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className={inputCls} />
              <div className="flex gap-3">
                <Button onClick={() => setShowResetModal(null)} variant="outline" className="flex-1 py-3 rounded-xl border-2 font-semibold">Cancel</Button>
                <Button onClick={handleResetPassword} disabled={saving}
                  className="flex-1 py-3 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-60 text-white rounded-xl font-semibold active:scale-95">
                  {saving ? 'Saving…' : 'Reset'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
