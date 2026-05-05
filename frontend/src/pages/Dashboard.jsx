// Dashboard.jsx
// Main dashboard page for DOH-NIR Health Statistics Dashboard

import { useState, useEffect } from 'react'
import { getHealthData } from '../services/api'

export default function Dashboard({ user, onLogout }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedMonth, setSelectedMonth] = useState(1)

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ]

  useEffect(() => {
    fetchData()
  }, [selectedMonth])

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await getHealthData({
        indicator_code: 'CPAB_PCT',
        year: 2026,
        month: selectedMonth
      })
      setData(result.data)
    } catch (err) {
      setError('Failed to load data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    onLogout()
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Top Navigation */}
      <nav className="bg-blue-900 text-white px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold">DOH-NIR CHD Dashboard</h1>
          <p className="text-blue-300 text-xs">Health Statistics System</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium">{user?.full_name || user?.username}</p>
            <p className="text-blue-300 text-xs capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-blue-800 hover:bg-blue-700 px-3 py-1 rounded text-sm transition"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="p-6">

        {/* Page Title */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            Child Protected at Birth (CPAB)
          </h2>
          <p className="text-gray-500 text-sm">
            Coverage percentage by municipality — 2026
          </p>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl shadow p-4 mb-6 flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">
            Select Month:
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label} 2026
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-500">
            {data.length} locations
          </span>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800">
              CPAB Coverage by Location
            </h3>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading data...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">
              {error}
            </div>
          ) : data.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No data available for this period.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-gray-600 font-medium">
                    Location
                  </th>
                  <th className="text-left px-6 py-3 text-gray-600 font-medium">
                    PSGC
                  </th>
                  <th className="text-right px-6 py-3 text-gray-600 font-medium">
                    Coverage (%)
                  </th>
                  <th className="text-left px-6 py-3 text-gray-600 font-medium">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-gray-800">
                      {row.location}
                    </td>
                    <td className="px-6 py-3 text-gray-500">
                      {row.psgc}
                    </td>
                    <td className="px-6 py-3 text-right font-medium">
                      {row.value !== null
                        ? `${row.value.toFixed(1)}%`
                        : '—'}
                    </td>
                    <td className="px-6 py-3">
                      {row.value === null ? (
                        <span className="text-gray-400 text-xs">No data</span>
                      ) : row.value >= 95 ? (
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                          On target
                        </span>
                      ) : row.value >= 80 ? (
                        <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full">
                          Near target
                        </span>
                      ) : (
                        <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">
                          Below target
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}