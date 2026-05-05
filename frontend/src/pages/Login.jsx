// Login.jsx
// DOH-NIR CHD Health Statistics Dashboard
// Follows DOH Brand and Visual Identity Guidelines (DM 2025-0600)

import { useState } from 'react'
import { login } from '../services/api'

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await login(username, password)
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))
      onLogin(data.user)
    } catch (err) {
      setError('Invalid username or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex"
      style={{ backgroundColor: '#EEFAF6' }}>

      {/* Left Panel — DOH Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12"
        style={{ backgroundColor: '#1F2A45' }}>

        {/* Logos */}
        <div className="flex items-center gap-6 mb-8">
          <img
            src="/images/DOH SEAL - FULL COLOR.png"
            alt="DOH Seal"
            className="w-24 h-24 object-contain"
          />
          <img
            src="/images/bagong-pilipinas white.png"
            alt="Bagong Pilipinas"
            className="w-24 h-24 object-contain"
          />
        </div>

        {/* NIR Wordmark */}
        <img
          src="/images/Center DOH NIR Wordmark White.png"
          alt="DOH Negros Island Region"
          className="w-72 object-contain mb-8"
        />

        {/* Divider */}
        <div className="w-16 h-1 rounded mb-8"
          style={{ backgroundColor: '#FFD700' }}>
        </div>

        {/* System Name */}
        <h2 className="text-white text-center text-xl font-semibold"
          style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Health Statistics Dashboard
        </h2>
        <p className="text-center text-sm mt-2"
          style={{ color: '#DEF0E9' }}>
          FHSIS Data Management System
        </p>

        {/* Footer text */}
        <p className="text-center text-xs mt-16"
          style={{ color: '#587CA5' }}>
          Republic of the Philippines<br />
          Department of Health<br />
          Negros Island Region Center for Health Development
        </p>
      </div>

      {/* Right Panel — Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8">

        {/* Mobile logos — shown only on small screens */}
        <div className="flex lg:hidden items-center gap-4 mb-8">
          <img
            src="/images/DOH SEAL - FULL COLOR.png"
            alt="DOH Seal"
            className="w-16 h-16 object-contain"
          />
          <img
            src="/images/bagong-pilipinas-logo.png"
            alt="Bagong Pilipinas"
            className="w-16 h-16 object-contain"
          />
        </div>

        {/* Form Card */}
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

          <div className="mb-6">
            <h1 className="text-2xl font-bold"
              style={{
                fontFamily: 'Montserrat, sans-serif',
                color: '#1F2A45'
              }}>
              Sign In
            </h1>
            <p className="text-sm mt-1"
              style={{ color: '#587CA5' }}>
              Enter your credentials to access the dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1"
                style={{ color: '#333333' }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2"
                style={{
                  borderColor: '#DEF0E9',
                  focusRingColor: '#0B4BAA'
                }}
                placeholder="Enter your username"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1"
                style={{ color: '#333333' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: '#DEF0E9' }}
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <div className="text-sm px-4 py-2 rounded-lg"
                style={{
                  backgroundColor: '#FFF0F0',
                  color: '#AD0F0A'
                }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-2 rounded-lg font-semibold text-sm transition hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '#0B4BAA' }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-xs mt-6"
            style={{ color: '#587CA5' }}>
            Need access? Contact your system administrator.
          </p>
        </div>

        {/* Bottom branding for mobile */}
        <div className="lg:hidden mt-8 text-center text-xs"
          style={{ color: '#365175' }}>
          Department of Health — Negros Island Region
        </div>
      </div>
    </div>
  )
}