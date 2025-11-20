import api from '@/lib/axios'

// Login
export const login = async (correo: string, password: string) => {
  const response = await api.post('/auth/login', { correo, password })
  return response.data
}

// Registro candidato
export const registerCandidato = async (userData: {
  name: string
  lastname: string
  correo: string
  password: string
  telefono?: string
  fecha_nacimiento?: string
  titulo?: string
  bio?: string
  ubicacion?: string
}) => {
  const response = await api.post('/auth/register/candidato', userData)
  return response.data
}

// Registro empresa
export const registerEmpresa = async (empresaData: {
  nombreEmpresa: string
  descripcionEmpresa?: string
  areaEmpresa?: string
  name: string
  lastname: string
  correo: string
  password: string
  telefono?: string
  posicion?: string
}) => {
  const response = await api.post('/auth/register/empresa', empresaData)
  return response.data
}

// Obtener perfil
export const getProfile = async () => {
  const response = await api.get('/auth/profile')
  return response.data
}

// Forgot password - solicitar recuperación
export const forgotPassword = async (correo: string) => {
  const response = await api.post('/auth/forgot-password', { correo })
  return response.data
}

// Reset password - restablecer con token
export const resetPassword = async (token: string, nuevaPassword: string) => {
  const response = await api.post('/auth/reset-password', { token, nuevaPassword })
  return response.data
}