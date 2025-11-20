import axios from 'axios'

const api = axios.create({
  baseURL: 'https://api.sw2ficct.lat/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para agregar el token a cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
