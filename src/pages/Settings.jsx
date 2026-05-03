import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { updateProfile, changePassword, getProfile } from '../services/api'
import './Settings.css'

const Settings = () => {
  const { user, updateUser, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    if (!user) navigate('/login')
  }, [user, navigate])

  if (!user) return null

  return (
    <div className="settings-page">
      <div className="settings-page__hero">
        <div className="container">
          <div className="settings-hero__inner">
            <div className="settings-avatar">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1>{user.name}</h1>
              <p>{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container settings-layout">
        <aside className="settings-sidebar">
          {[
            { id: 'profile',   icon: 'fas fa-user',        label: 'Profile Info' },
            { id: 'security',  icon: 'fas fa-lock',        label: 'Change Password' },
            { id: 'orders',    icon: 'fas fa-box',         label: 'My Orders' },
            { id: 'account',   icon: 'fas fa-cog',         label: 'Account' },
          ].map(tab => (
            <button
              key={tab.id}
              className={`settings-tab ${activeTab === tab.id ? 'settings-tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <i className={tab.icon}></i>
              <span>{tab.label}</span>
              <i className="fas fa-chevron-right settings-tab__arrow"></i>
            </button>
          ))}
        </aside>

        <div className="settings-content">
          {activeTab === 'profile'  && <ProfileTab user={user} updateUser={updateUser} />}
          {activeTab === 'security' && <SecurityTab />}
          {activeTab === 'orders'   && <OrdersTab />}
          {activeTab === 'account'  && <AccountTab logout={logout} navigate={navigate} />}
        </div>
      </div>
    </div>
  )
}

const ProfileTab = ({ user, updateUser }) => {
  const [form, setForm]       = useState({ name: user.name || '', email: user.email || '', phone: user.phone || '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError]     = useState('')

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return setError('Name is required')
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return setError('Valid email required')

    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await updateProfile(form)
      updateUser(res.data.user)
      setSuccess('Profile updated successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="settings-card">
      <div className="settings-card__header">
        <i className="fas fa-user"></i>
        <div>
          <h2>Profile Information</h2>
          <p>Update your name, email and phone number</p>
        </div>
      </div>

      {success && <div className="settings-alert settings-alert--success"><i className="fas fa-check-circle"></i> {success}</div>}
      {error   && <div className="settings-alert settings-alert--error"><i className="fas fa-exclamation-circle"></i> {error}</div>}

      <form onSubmit={handleSubmit} className="settings-form">
        <div className="form-row">
          <div className="form-group">
            <label>Full Name *</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Your full name" />
          </div>
          <div className="form-group">
            <label>Email Address *</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" />
          </div>
        </div>
        <div className="form-group" style={{ maxWidth: '320px' }}>
          <label>Phone Number</label>
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="10-digit mobile number" maxLength={10} />
        </div>

        <div className="settings-form__info">
          <i className="fas fa-info-circle"></i>
          Your email is used for login and order notifications.
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? <><i className="fas fa-spinner fa-spin"></i> Saving...</> : <><i className="fas fa-save"></i> Save Changes</>}
        </button>
      </form>
    </div>
  )
}

const SecurityTab = () => {
  const [form, setForm]       = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [showPass, setShowPass] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.currentPassword)          e.currentPassword = 'Current password is required'
    if (form.newPassword.length < 6)    e.newPassword     = 'New password must be at least 6 characters'
    if (form.newPassword !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    if (form.currentPassword === form.newPassword) e.newPassword = 'New password must be different'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    if (errors[e.target.name]) setErrors(er => ({ ...er, [e.target.name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setSuccess('')
    try {
      await changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword })
      setSuccess('Password changed successfully!')
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setErrors({ currentPassword: err.response?.data?.message || 'Failed to change password' })
    } finally {
      setLoading(false)
    }
  }

  const strength = (pwd) => {
    if (!pwd) return { label: '', color: '', width: '0%' }
    let score = 0
    if (pwd.length >= 6)  score++
    if (pwd.length >= 10) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++
    const levels = [
      { label: 'Very Weak', color: '#ef4444', width: '20%' },
      { label: 'Weak',      color: '#f97316', width: '40%' },
      { label: 'Fair',      color: '#eab308', width: '60%' },
      { label: 'Strong',    color: '#22c55e', width: '80%' },
      { label: 'Very Strong', color: '#16a34a', width: '100%' },
    ]
    return levels[Math.min(score, 4)]
  }

  const str = strength(form.newPassword)

  return (
    <div className="settings-card">
      <div className="settings-card__header">
        <i className="fas fa-lock"></i>
        <div>
          <h2>Change Password</h2>
          <p>Keep your account secure with a strong password</p>
        </div>
      </div>

      {success && <div className="settings-alert settings-alert--success"><i className="fas fa-check-circle"></i> {success}</div>}

      <form onSubmit={handleSubmit} className="settings-form">
        <div className={`form-group ${errors.currentPassword ? 'form-group--error' : ''}`}>
          <label>Current Password *</label>
          <div className="input-icon-wrap">
            <i className="fas fa-lock"></i>
            <input
              type={showPass ? 'text' : 'password'}
              name="currentPassword"
              value={form.currentPassword}
              onChange={handleChange}
              placeholder="Your current password"
            />
            <button type="button" className="input-toggle-pass" onClick={() => setShowPass(s => !s)}>
              <i className={`fas fa-eye${showPass ? '-slash' : ''}`}></i>
            </button>
          </div>
          {errors.currentPassword && <span className="form-error">{errors.currentPassword}</span>}
        </div>

        <div className={`form-group ${errors.newPassword ? 'form-group--error' : ''}`}>
          <label>New Password *</label>
          <div className="input-icon-wrap">
            <i className="fas fa-lock"></i>
            <input
              type={showPass ? 'text' : 'password'}
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              placeholder="Min. 6 characters"
            />
          </div>
          {form.newPassword && (
            <div className="password-strength">
              <div className="password-strength__bar">
                <div style={{ width: str.width, background: str.color, height: '100%', borderRadius: '4px', transition: 'all 0.3s' }}></div>
              </div>
              <span style={{ color: str.color, fontSize: '0.75rem', fontWeight: 600 }}>{str.label}</span>
            </div>
          )}
          {errors.newPassword && <span className="form-error">{errors.newPassword}</span>}
        </div>

        <div className={`form-group ${errors.confirmPassword ? 'form-group--error' : ''}`}>
          <label>Confirm New Password *</label>
          <div className="input-icon-wrap">
            <i className="fas fa-lock"></i>
            <input
              type={showPass ? 'text' : 'password'}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat new password"
            />
          </div>
          {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
        </div>

        <div className="settings-form__info">
          <i className="fas fa-shield-alt"></i>
          Use at least 8 characters with uppercase, numbers and symbols for a strong password.
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? <><i className="fas fa-spinner fa-spin"></i> Updating...</> : <><i className="fas fa-key"></i> Change Password</>}
        </button>
      </form>
    </div>
  )
}

const OrdersTab = () => {
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    import('../services/api').then(({ getMyOrders }) => {
      getMyOrders()
        .then(res => { setOrders(res.data.orders || []); setLoading(false) })
        .catch(() => setLoading(false))
    })
  }, [])

  const statusColor = (s) => ({
    placed: '#6c63ff', confirmed: '#3b82f6', shipped: '#f59e0b',
    delivered: '#16a34a', cancelled: '#ef4444',
  }[s] || '#888')

  return (
    <div className="settings-card">
      <div className="settings-card__header">
        <i className="fas fa-box"></i>
        <div><h2>My Orders</h2><p>Track and manage your orders</p></div>
      </div>

      {loading ? (
        <div className="settings-loading"><i className="fas fa-spinner fa-spin"></i> Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="settings-empty">
          <i className="fas fa-box-open"></i>
          <p>No orders yet</p>
          <a href="/products" className="btn-primary" style={{ display: 'inline-flex', gap: '8px', marginTop: '12px' }}>
            <i className="fas fa-shopping-bag"></i> Start Shopping
          </a>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order._id} className="order-item">
              <div className="order-item__top">
                <div>
                  <span className="order-item__id">#{order._id.slice(-8).toUpperCase()}</span>
                  <span className="order-item__date">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <span className="order-item__status" style={{ background: statusColor(order.orderStatus) + '20', color: statusColor(order.orderStatus) }}>
                  {order.orderStatus}
                </span>
              </div>
              <div className="order-item__products">
                {order.items?.slice(0, 3).map((item, i) => (
                  <img key={i} src={item.image} alt={item.name} title={item.name} />
                ))}
                {order.items?.length > 3 && <span>+{order.items.length - 3}</span>}
              </div>
              <div className="order-item__footer">
                <span>{order.items?.length} item{order.items?.length > 1 ? 's' : ''}</span>
                <strong>₹{order.totalPrice?.toLocaleString()}</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const AccountTab = ({ logout, navigate }) => {
  const [showConfirm, setShowConfirm] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="settings-card">
      <div className="settings-card__header">
        <i className="fas fa-cog"></i>
        <div><h2>Account Settings</h2><p>Manage your account preferences</p></div>
      </div>

      <div className="account-actions">
        <div className="account-action-item">
          <div>
            <h4><i className="fas fa-sign-out-alt"></i> Logout</h4>
            <p>Sign out from your account on this device</p>
          </div>
          <button className="btn-outline" onClick={handleLogout}>Logout</button>
        </div>

        <div className="account-action-item account-action-item--danger">
          <div>
            <h4><i className="fas fa-trash-alt"></i> Delete Account</h4>
            <p>Permanently delete your account and all data. This cannot be undone.</p>
          </div>
          <button
            className="btn-danger"
            onClick={() => setShowConfirm(true)}
          >
            Delete
          </button>
        </div>
      </div>

      {showConfirm && (
        <div className="confirm-modal">
          <div className="confirm-modal__box">
            <i className="fas fa-exclamation-triangle"></i>
            <h3>Delete Account?</h3>
            <p>This will permanently delete your account and all your data. This action cannot be undone.</p>
            <div className="confirm-modal__actions">
              <button className="btn-outline" onClick={() => setShowConfirm(false)}>Cancel</button>
              <button className="btn-danger" onClick={() => { logout(); navigate('/') }}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings
