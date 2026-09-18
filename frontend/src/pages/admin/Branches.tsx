import { useState, useEffect, useCallback } from 'react'
import {
  GitBranch, Plus, Search, Edit3, Trash2, BarChart2,
  MapPin, Phone, Mail, Check, X, AlertCircle, RefreshCw,
  ChevronDown, Users, Package, TrendingUp,
} from 'lucide-react'
import { Card, Spinner } from '@components/common'
import { Button } from '@components/common'
import api from '@services/api'

interface Branch {
  id: number
  name: string
  location?: string
  phone?: string
  email?: string
  is_active: boolean
  user_count: number
  product_count: number
  created_at: string
}

interface BranchStats {
  branch_id: number
  total_products: number
  total_users: number
  total_sales: number
  total_revenue: number
}

const fmt = (n: number) => `RWF ${Math.round(n).toLocaleString()}`

export default function AdminBranches() {
  const [branches, setBranches]     = useState<Branch[]>([])
  const [loading,  setLoading]      = useState(true)
  const [search,   setSearch]       = useState('')
  const [showModal, setShowModal]   = useState(false)
  const [editBranch, setEditBranch] = useState<Branch | null>(null)
  const [statsModal, setStatsModal] = useState<{ branch: Branch; stats: BranchStats } | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const [error,   setError]         = useState('')
  const [success, setSuccess]       = useState('')
  const [saving,  setSaving]        = useState(false)

  const [form, setForm] = useState({ name: '', location: '', phone: '', email: '' })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/branches?limit=100')
      setBranches(res.data.data?.items || [])
    } catch { flash('Failed to load branches', true) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const flash = (msg: string, isError = false) => {
    if (isError) { setError(msg); setTimeout(() => setError(''), 4000) }
    else         { setSuccess(msg); setTimeout(() => setSuccess(''), 3000) }
  }

  const openCreate = () => {
    setEditBranch(null)
    setForm({ name: '', location: '', phone: '', email: '' })
    setShowModal(true)
  }

  const openEdit = (b: Branch) => {
    setEditBranch(b)
    setForm({ name: b.name, location: b.location || '', phone: b.phone || '', email: b.email || '' })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) { flash('Branch name is required', true); return }
    setSaving(true)
    try {
      if (editBranch) {
        await api.put(`/branches/${editBranch.id}`, form)
        flash('Branch updated')
      } else {
        await api.post('/branches', form)
        flash('Branch created')
      }
      setShowModal(false)
      load()
    } catch (e: unknown) {
      flash((e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to save', true)
    } finally { setSaving(false) }
  }

  const handleDelete = async (b: Branch) => {
    if (!window.confirm(`Delete branch "${b.name}"? This cannot be undone.`)) return
    try {
      await api.delete(`/branches/${b.id}`)
      setBranches(prev => prev.filter(x => x.id !== b.id))
      flash('Branch deleted')
    } catch (e: unknown) {
      flash((e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to delete', true)
    }
  }

  const openStats = async (b: Branch) => {
    setStatsLoading(true)
    try {
      const res = await api.get(`/branches/${b.id}/stats`)
      setStatsModal({ branch: b, stats: res.data.data })
    } catch { flash('Failed to load stats', true) }
    finally { setStatsLoading(false) }
  }

  const filtered = branches.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    (b.location || '').toLowerCase().includes(search.toLowerCase())
  )

  const inputCls = 'w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 bg-white transition-colors'

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <GitBranch size={28} className="text-primary-600" /> Branch Management
          </h1>
          <p className="text-gray-500 mt-1">Manage your business locations</p>
        </div>
        <div className="flex gap-3">
          <button onClick={load} className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <Button onClick={openCreate}
            className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 shadow-md active:scale-95 transition-all">
            <Plus size={18} /> Add Branch
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {error   && <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium flex items-center gap-2"><AlertCircle size={16}/>{error}</div>}
      {success && <div className="px-4 py-3 bg-success-50 border border-success-200 rounded-xl text-sm text-success-700 font-medium flex items-center gap-2"><Check size={16}/>{success}</div>}

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Branches', value: String(branches.length),   color: 'text-primary-600',  bg: 'bg-primary-50' },
          { label: 'Active',         value: String(branches.filter(b => b.is_active).length), color: 'text-success-600', bg: 'bg-success-50' },
          { label: 'Total Staff',    value: String(branches.reduce((s, b) => s + (b.user_count ?? 0), 0)), color: 'text-accent-600', bg: 'bg-accent-50' },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} rounded-2xl p-4 border border-gray-100`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-sm text-gray-500 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <Card>
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by name or location..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400" />
        </div>
      </Card>

      {/* Branch grid */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <Card>
          <div className="py-16 text-center">
            <GitBranch size={48} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No branches found</p>
            <Button onClick={openCreate} className="mt-4 bg-primary-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold">
              <Plus size={15} className="mr-1.5" /> Add First Branch
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(b => (
            <div key={b.id} className={`bg-white rounded-2xl shadow-sm border-2 transition-all hover:shadow-lg ${b.is_active ? 'border-gray-100 hover:border-primary-200' : 'border-gray-100 opacity-60'}`}>
              <div className="p-5">
                {/* Name + status */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {b.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{b.name}</h3>
                      <span className={`text-xs font-semibold ${b.is_active ? 'text-success-600' : 'text-gray-400'}`}>
                        {b.is_active ? '● Active' : '● Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1.5 mb-4 text-sm text-gray-500">
                  {b.location && <p className="flex items-center gap-2"><MapPin size={13} className="text-gray-400 flex-shrink-0" />{b.location}</p>}
                  {b.phone    && <p className="flex items-center gap-2"><Phone size={13} className="text-gray-400 flex-shrink-0" />{b.phone}</p>}
                  {b.email    && <p className="flex items-center gap-2"><Mail size={13} className="text-gray-400 flex-shrink-0" />{b.email}</p>}
                </div>

                {/* Mini stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-gray-900">{b.user_count ?? 0}</p>
                    <p className="text-xs text-gray-500 flex items-center justify-center gap-1"><Users size={11} /> Staff</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-gray-900">{b.product_count ?? 0}</p>
                    <p className="text-xs text-gray-500 flex items-center justify-center gap-1"><Package size={11} /> Products</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button onClick={() => openStats(b)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-xl text-xs font-semibold transition-colors">
                    {statsLoading ? <RefreshCw size={13} className="animate-spin" /> : <BarChart2 size={13} />}
                    Stats
                  </button>
                  <button onClick={() => openEdit(b)}
                    className="flex items-center justify-center gap-1 p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-colors">
                    <Edit3 size={15} />
                  </button>
                  <button onClick={() => handleDelete(b)}
                    className="flex items-center justify-center gap-1 p-2 bg-gray-100 hover:bg-red-50 hover:text-red-500 text-gray-600 rounded-xl transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                {editBranch ? <Edit3 size={18} className="text-primary-600" /> : <Plus size={18} className="text-primary-600" />}
                {editBranch ? 'Edit Branch' : 'Add New Branch'}
              </h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 bg-gray-100 hover:bg-red-50 rounded-lg flex items-center justify-center"><X size={15} /></button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { key: 'name',     label: 'Branch Name',    placeholder: 'e.g. Main Store', required: true },
                { key: 'location', label: 'Location',       placeholder: 'e.g. KG 123 St, Kigali' },
                { key: 'phone',    label: 'Phone',          placeholder: '+250 7XX XXX XXX' },
                { key: 'email',    label: 'Email',          placeholder: 'branch@example.com' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    {f.label} {f.required && <span className="text-red-500">*</span>}
                  </label>
                  <input type="text" placeholder={f.placeholder}
                    value={form[f.key as keyof typeof form]}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    className={inputCls} />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <Button onClick={() => setShowModal(false)} variant="outline" className="flex-1 py-3 rounded-xl border-2 font-semibold">Cancel</Button>
                <Button onClick={handleSave} disabled={saving}
                  className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white rounded-xl font-semibold active:scale-95 transition-all">
                  {saving ? 'Saving…' : editBranch ? 'Save Changes' : 'Create Branch'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Modal */}
      {statsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <BarChart2 size={18} className="text-primary-600" /> {statsModal.branch.name} — Stats
              </h2>
              <button onClick={() => setStatsModal(null)} className="w-8 h-8 bg-gray-100 hover:bg-red-50 rounded-lg flex items-center justify-center"><X size={15} /></button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              {[
                { icon: <Users size={20} className="text-primary-600" />,    label: 'Staff',    value: String(statsModal.stats.total_users) },
                { icon: <Package size={20} className="text-accent-600" />,   label: 'Products', value: String(statsModal.stats.total_products) },
                { icon: <TrendingUp size={20} className="text-success-600" />,label: 'Sales',   value: String(statsModal.stats.total_sales) },
                { icon: <BarChart2 size={20} className="text-purple-600" />, label: 'Revenue',  value: fmt(statsModal.stats.total_revenue) },
              ].map((s, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="flex justify-center mb-2">{s.icon}</div>
                  <p className="text-xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="px-6 pb-5">
              <Button onClick={() => setStatsModal(null)} className="w-full bg-primary-600 text-white py-2.5 rounded-xl font-semibold">Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
