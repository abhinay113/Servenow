import axios from 'axios'

const backendUrl = import.meta.env.VITE_API_URL || '/api'
const api = axios.create({
  baseURL: backendUrl,
  headers: { 'Content-Type': 'application/json' }
})

// Attach userId to every request if logged in
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  if (user?._id) config.headers['x-user-id'] = user._id
  return config
})

export default api