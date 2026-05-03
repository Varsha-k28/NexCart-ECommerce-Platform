import React, { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import './UPIModal.css'

const UPI_APPS = [
  { name: 'GPay',    color: '#4285F4', bg: '#e8f0fe', icon: 'fab fa-google'      },
  { name: 'PhonePe', color: '#5f259f', bg: '#f3e8ff', icon: 'fas fa-mobile-alt'  },
  { name: 'Paytm',   color: '#00BAF2', bg: '#e0f7fe', icon: 'fas fa-wallet'       },
  { name: 'BHIM',    color: '#00529C', bg: '#e3f0ff', icon: 'fas fa-university'   },
]

const AppIcon = ({ app }) => (
  <div className="upi-modal__app">
    <div className="upi-app-icon" style={{ background: app.bg, border: `2px solid ${app.color}33` }}>
      <i className={app.icon} style={{ color: app.color, fontSize: '1.2rem' }}></i>
    </div>
    <span>{app.name}</span>
  </div>
)

const UPIModal = ({ amount, onSuccess, onClose }) => {
  const [stage,    setStage]    = useState('qr')
  const [timer,    setTimer]    = useState(300)
  const [tab,      setTab]      = useState('qr')
  const [upiInput, setUpiInput] = useState('')

  const upiId     = 'nexcart@upi'
  const upiString = `upi://pay?pa=${upiId}&pn=NexCart&am=${amount}&cu=INR&tn=NexCart%20Order`

  useEffect(() => {
    if (stage !== 'qr') return
    if (timer <= 0) { onClose(); return }
    const id = setInterval(() => setTimer(t => t - 1), 1000)
    return () => clearInterval(id)
  }, [timer, stage, onClose])

  const formatTime    = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  const timerPercent  = (timer / 300) * 100
  const timerColor    = timer > 120 ? '#16a34a' : timer > 60 ? '#f59e0b' : '#dc2626'
  const isValidUPI    = upiInput.includes('@') && upiInput.length > 4

  const handleSimulate = () => {
    setStage('processing')
    setTimeout(() => { setStage('success'); setTimeout(() => onSuccess(), 1500) }, 2000)
  }

  return (
    <div className="upi-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="upi-modal">

        <div className="upi-modal__header">
          <div className="upi-modal__brand">
            <div className="upi-logo-badge">UPI</div>
            <span>Secure Payment</span>
          </div>
          <button className="upi-modal__close" onClick={onClose} aria-label="Close">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="upi-modal__amount">
          <div className="upi-amount-label">Total Amount</div>
          <div className="upi-amount-value">₹{amount.toLocaleString()}</div>
          <div className="upi-amount-merchant">
            <i className="fas fa-store"></i> NexCart
          </div>
        </div>

        <div className="upi-modal__apps">
          {UPI_APPS.map(app => <AppIcon key={app.name} app={app} />)}
        </div>

        <div className="upi-modal__tabs">
          <button className={`upi-tab ${tab === 'qr' ? 'upi-tab--active' : ''}`} onClick={() => setTab('qr')}>
            <i className="fas fa-qrcode"></i> Scan QR
          </button>
          <button className={`upi-tab ${tab === 'id' ? 'upi-tab--active' : ''}`} onClick={() => setTab('id')}>
            <i className="fas fa-at"></i> UPI ID
          </button>
        </div>

        {tab === 'qr' && stage === 'qr' && (
          <div className="upi-modal__qr-section">
            <div className="upi-modal__qr-wrap">
              <QRCodeSVG value={upiString} size={190} bgColor="#ffffff" fgColor="#1a1a2e" level="H" includeMargin={true} />
              <div className="upi-modal__qr-logo">
                <i className="fas fa-shopping-bag"></i>
              </div>
            </div>
            <p className="upi-modal__qr-hint">
              <i className="fas fa-mobile-alt"></i> Open GPay / PhonePe / Paytm → Scan QR → Pay
            </p>
            <div className="upi-modal__timer-wrap">
              <div className="upi-timer-bar">
                <div className="upi-timer-fill" style={{ width: `${timerPercent}%`, background: timerColor }}></div>
              </div>
              <div className="upi-timer-text" style={{ color: timerColor }}>
                <i className="fas fa-clock"></i> Expires in <strong>{formatTime(timer)}</strong>
              </div>
            </div>
          </div>
        )}

        {tab === 'id' && stage === 'qr' && (
          <div className="upi-modal__id-section">
            <div className="form-group">
              <label>Enter your UPI ID</label>
              <div className="upi-id-input-wrap">
                <i className="fas fa-at upi-id-icon"></i>
                <input
                  type="text"
                  value={upiInput}
                  onChange={e => setUpiInput(e.target.value)}
                  placeholder="yourname@upi"
                  autoFocus
                />
                {isValidUPI && <i className="fas fa-check-circle upi-id-valid"></i>}
              </div>
            </div>
            <div className="upi-id-apps-hint">
              <span>Supported:</span>
              {['@okaxis', '@ybl', '@paytm', '@upi', '@oksbi'].map(s => <code key={s}>{s}</code>)}
            </div>
            {isValidUPI && (
              <div className="upi-id-verified">
                <i className="fas fa-check-circle"></i> UPI ID looks valid
              </div>
            )}
          </div>
        )}

        {stage === 'processing' && (
          <div className="upi-modal__processing">
            <div className="upi-processing-ring">
              <i className="fas fa-spinner fa-spin"></i>
            </div>
            <p>Processing Payment...</p>
            <span>Please wait, do not close this window</span>
          </div>
        )}

        {stage === 'success' && (
          <div className="upi-modal__success">
            <div className="upi-success-ring">
              <i className="fas fa-check"></i>
            </div>
            <p>Payment Successful!</p>
            <span>₹{amount.toLocaleString()} paid via UPI</span>
          </div>
        )}

        {stage === 'qr' && (
          <div className="upi-modal__simulate">
            <div className="upi-simulate-label">
              <i className="fas fa-flask"></i> Demo Mode
            </div>
            <button className="upi-simulate-btn" onClick={handleSimulate}>
              <i className="fas fa-bolt"></i> Simulate Payment Success
            </button>
            <p className="upi-simulate-note">
              For demo only — real UPI payment requires live Razorpay keys
            </p>
          </div>
        )}

        <div className="upi-modal__footer">
          <i className="fas fa-lock"></i>
          <span>Paying to <strong>{upiId}</strong></span>
          <span className="upi-footer-secure">
            <i className="fas fa-shield-alt"></i> 256-bit SSL
          </span>
        </div>

      </div>
    </div>
  )
}

export default UPIModal
