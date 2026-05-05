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
      localStorage.removeItem('user')
      window.location.href = '/login'
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
// UPLOAD
// =====================================================
export const uploadFile = async (file, templateId, year, month) => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await API.post(
    `/upload?template_id=${templateId}&year=${year}&month=${month}`,
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

export default API