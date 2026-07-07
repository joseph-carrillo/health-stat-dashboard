// api.js
// Handles all communication with the FastAPI backend
// DOH-NIR CHD Health Statistics Dashboard

import axios from 'axios'

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Automatically attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 responses — redirect to login
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('token_type')
      localStorage.removeItem('user')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

// =====================================================
// AUTH
// =====================================================
export const login = async (username, password) => {
  const formData = new FormData()
  formData.append('username', username)
  formData.append('password', password)
  const response = await axios.post('/api/login', formData)
  return response.data
}

export const register = async (username, password, fullName, email) => {
  const response = await API.post(
    `/register?username=${username}&password=${password}&full_name=${fullName}&email=${email}`
  )
  return response.data
}

// =====================================================
// HEALTH DATA
// =====================================================
export const getHealthData = async (params = {}) => {
  const response = await API.get('/health-data', { params })
  return response.data
}

// =====================================================
// REFERENCE DATA
// =====================================================
export const getPrograms = async () => {
  const response = await API.get('/programs')
  return response.data
}

export const getIndicators = async (programCode) => {
  const response = await API.get('/indicators', {
    params: programCode ? { program_code: programCode } : {},
  })
  return response.data
}

export const getLocations = async (params = {}) => {
  const response = await API.get('/locations', { params })
  return response.data
}

export const getPeriods = async (year) => {
  const response = await API.get('/periods', { params: year ? { year } : {} })
  return response.data
}

// =====================================================
// AGGREGATE / DASHBOARD DATA
// =====================================================
export const getScorecard = async (params = {}) => {
  const response = await API.get('/scorecard', { params })
  return response.data
}

export const getCoverage = async (params = {}) => {
  const response = await API.get('/coverage', { params })
  return response.data
}

export const getCoverageDetail = async (params = {}) => {
  const response = await API.get('/coverage-detail', { params })
  return response.data
}

export const getTrend = async (params = {}) => {
  const response = await API.get('/trend', { params })
  return response.data
}

export const getDataAvailability = async (params = {}) => {
  const response = await API.get('/data-availability', { params })
  return response.data
}

export const setIndicatorTarget = async (indicatorId, targetValue, targetYear) => {
  const response = await API.patch(
    `/indicators/${indicatorId}/target?target_value=${targetValue}&target_year=${targetYear}`
  )
  return response.data
}

// =====================================================
// UPLOAD
// =====================================================
export const getUploadCatalog = async () => {
  const response = await API.get('/upload-catalog')
  return response.data
}

export const uploadFile = async (file, templateId, year, month, dryRun = false) => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await API.post(
    `/upload?template_id=${templateId}&year=${year}&month=${month}&dry_run=${dryRun}`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
  return response.data
}

// =====================================================
// STAGING
// =====================================================
export const getBatchSummary = async (batchId) => {
  const response = await API.get(`/staging/${batchId}`)
  return response.data
}

export const getConflicts = async (batchId) => {
  const response = await API.get(`/staging/${batchId}/conflicts`)
  return response.data
}

export const getStagedRows = async (batchId) => {
  const response = await API.get(`/staging/${batchId}/rows`)
  return response.data
}

export const resolveConflict = async (stagingId, decision) => {
  const response = await API.post(
    `/staging/conflict/${stagingId}/resolve?decision=${decision}`
  )
  return response.data
}

export const resolveConflictsBulk = async (batchId, decision, stagingIds = null) => {
  const body = stagingIds?.length ? { staging_ids: stagingIds } : {}
  const response = await API.post(
    `/staging/${batchId}/conflicts/resolve-bulk?decision=${decision}`,
    body
  )
  return response.data
}

export const approveBatch = async (batchId) => {
  const response = await API.post(`/staging/${batchId}/approve`)
  return response.data
}

// =====================================================
// USER MANAGEMENT
// =====================================================
export const getAllUsers = async () => {
  const response = await API.get('/admin/users')
  return response.data
}

export const getPendingUsers = async () => {
  const response = await API.get('/admin/users/pending')
  return response.data
}

export const assignRole = async (userId, role, programCode) => {
  const response = await API.post(
    `/admin/users/${userId}/assign-role?role=${role}&program_code=${programCode}`
  )
  return response.data
}

export const deactivateUser = async (userId) => {
  const response = await API.post(`/admin/users/${userId}/deactivate`)
  return response.data
}

export const getAuditLog = async (limit = 100) => {
  const response = await API.get('/admin/audit', { params: { limit } })
  return response.data
}

// =====================================================
// ESR REPORTS
// =====================================================
export const submitEsrReport = async (payload) => {
  const response = await API.post('/esr-reports', payload)
  return response.data
}

// =====================================================
// TEMPLATE REPORTS (raw "Excel face")
// =====================================================
export const getTemplates = async () => {
  const response = await API.get('/templates')
  return response.data
}

export const getTemplateReport = async (templateId, params = {}) => {
  const response = await API.get(`/templates/${templateId}/report`, { params })
  return response.data
}

export default API