import axios from 'axios'

const backendUrl = import.meta.env.VITE_API_URL || '/api'
const api = axios.create({
  baseURL: backendUrl,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  if (user?._id) config.headers['x-user-id'] = user._id
  return config
})

api.interceptors.response.use(
  response => response,
  error => {
    console.error('API error', error.response?.status, error.response?.data)
    return Promise.reject(error)
  }
)

export default api